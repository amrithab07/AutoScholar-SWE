from fastapi import FastAPI, Depends, HTTPException, APIRouter, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from app.services.search import SearchService
from app.services.ai_features import get_ai_service
from app.services.arxiv_ingest import es, INDEX_NAME
from app.api.endpoints.novelty import router as novelty_router
from app.api.endpoints.graph import router as graph_router
import logging
import traceback

# Initialize search service safely so startup doesn't crash requests if
# dependencies (Elasticsearch, model downloads, FAISS) aren't available.
logger = logging.getLogger("autoscolar")
search_service = None
try:
    search_service = SearchService()
except Exception as e:
    # Log full traceback to help debugging (will appear in uvicorn logs)
    logger.exception("Failed to initialize SearchService: %s", e)
    # Keep search_service as None and let endpoints return 503 with a helpful message

app = FastAPI(
    title="AutoScholar API",
    description="API for AutoScholar - AI-powered research publication retrieval system",
    version="1.0.0"
)

# Include novelty router
app.include_router(novelty_router, prefix="/api/novelty")
# Include graph router
app.include_router(graph_router, prefix="/api/graph")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for demonstration
mock_papers = [
    {
        "id": "1",
        "title": "Attention Is All You Need",
        "authors": ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
        "journal": "Advances in Neural Information Processing Systems",
        "year": 2017,
        "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
        "keywords": ["Attention Mechanism", "Transformer", "Neural Networks"],
        "citation_count": 45000
    },
    {
        "id": "2",
        "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        "authors": ["Devlin, J.", "Chang, M.W.", "Lee, K.", "Toutanova, K."],
        "journal": "Proceedings of NAACL-HLT",
        "year": 2019,
        "abstract": "We introduce a new language representation model called BERT...",
        "keywords": ["BERT", "Transformers", "Pre-training", "NLP"],
        "citation_count": 32000
    }
]

# Models
class SearchQuery(BaseModel):
    query: str
    search_type: str = "hybrid"
    limit: int = 10

class CitationRequest(BaseModel):
    paper_ids: List[str]
    style: str = "APA"

# Search endpoints
@app.post("/api/search")
async def search_papers(query: SearchQuery):
    """Search for papers using keyword, semantic, or hybrid search"""
    return {"results": mock_papers, "count": len(mock_papers)}

# Add /api/v1/search for frontend compatibility
@app.post("/api/v1/search")
async def search_papers_v1(query: SearchQuery):
    """
    Search papers using hybrid (BM25 + vector) or keyword-only method.
    """
    try:
        if search_service is None:
            # Service failed to initialize (see startup logs).
            # Return mock results (so frontend receives valid JSON) while you debug startup errors.
            logger.warning("SearchService unavailable; returning mock results to frontend")
            return {"results": mock_papers, "count": len(mock_papers)}

        if query.search_type == "keyword":
            results = search_service.keyword_search(query.query, size=query.limit)
        elif query.search_type == "vector":
            results = search_service.vector_search(query.query, size=query.limit)
        else:  # hybrid
            results = search_service.hybrid_search(query.query, size=query.limit)

        return {"results": results, "count": len(results)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/papers/{paper_id}")
async def get_paper(paper_id: str):
    """Get details for a specific paper"""
    paper = next((p for p in mock_papers if p["id"] == paper_id), None)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

# AI feature endpoints
@app.post("/api/ai/summarize")
async def summarize_paper(paper_id: str):
    """Generate AI summary for a paper"""
    # Try to fetch paper from Elasticsearch
    try:
        doc = es.get(index=INDEX_NAME, id=paper_id)
        src = doc.get('_source', {})
        text = src.get('abstract') or src.get('summary') or src.get('description') or src.get('title') or ''
    except Exception:
        raise HTTPException(status_code=404, detail="Paper not found")

    ai = get_ai_service()
    summary = ai.generate_summary(text)
    return {"paper_id": paper_id, "summary": summary}

@app.post("/api/ai/question")
async def answer_question(paper_id: str, question: str):
    """Answer a question about a paper using AI"""
    try:
        doc = es.get(index=INDEX_NAME, id=paper_id)
        src = doc.get('_source', {})
        context = src.get('abstract') or src.get('summary') or src.get('description') or ''
    except Exception:
        raise HTTPException(status_code=404, detail="Paper not found")

    ai = get_ai_service()
    answer = ai.answer_question(question, context)
    return {"paper_id": paper_id, "question": question, "answer": answer}


@app.post("/api/ai/summarize-papers")
async def summarize_papers(paper_ids: List[str], max_length: int = 200, min_length: int = 40):
    ai = get_ai_service()
    summaries = []
    for pid in paper_ids:
        try:
            doc = es.get(index=INDEX_NAME, id=pid)
            src = doc.get('_source', {})
            text = src.get('abstract') or src.get('summary') or src.get('description') or src.get('title') or ''
        except Exception:
            text = ''
        summaries.append({"paper_id": pid, "summary": ai.generate_summary(text, max_length=max_length, min_length=min_length)})
    return {"summaries": summaries}


@app.post("/api/ai/compare-papers")
async def compare_papers(
    paper_ids: List[str] = Body(..., embed=False),
    prompt: Optional[str] = Body(None, embed=False),
    max_length: int = Body(300, embed=False),
    min_length: int = Body(50, embed=False)
):
    ai = get_ai_service()
    papers = []
    for pid in paper_ids:
        try:
            doc = es.get(index=INDEX_NAME, id=pid)
            src = doc.get('_source', {})
        except Exception:
            src = {}
        papers.append({"id": pid, "title": src.get('title'), "abstract": src.get('abstract') or src.get('summary') or src.get('description') or ''})

    parts = []
    for i, p in enumerate(papers, start=1):
        parts.append(f"Paper {i}: {p.get('title','(no title)')}\nAbstract: {p.get('abstract','(no abstract)')}\n")
    if prompt:
        parts.append(f"Comparison prompt: {prompt}\n")
    else:
        parts.append("Summarize differences and similarities focusing on methods, data, results, and conclusions.\n")

    compare_text = "\n---\n".join(parts)
    per_summaries = [{"paper_id": p['id'], "summary": ai.generate_summary(p['abstract'], max_length=150, min_length=40)} for p in papers]
    comparison = ai.generate_summary(compare_text, max_length=max_length, min_length=min_length)
    return {"papers": per_summaries, "comparison": comparison}

# Recommendation endpoints
@app.get("/api/recommendations/user/{user_id}")
async def get_recommendations(user_id: str, limit: int = 5):
    """Get personalized paper recommendations for a user"""
    return {"recommendations": mock_papers[:limit]}

@app.get("/api/recommendations/trending")
async def get_trending_papers(limit: int = 5):
    """Get trending papers"""
    return {"trending": mock_papers[:limit]}

# Citation endpoints
@app.post("/api/citations/format")
async def format_citations(request: CitationRequest):
    """Format citations in the requested style"""
    citations = []
    for paper_id in request.paper_ids:
        paper = next((p for p in mock_papers if p["id"] == paper_id), None)
        if paper:
            if request.style == "APA":
                citation = f"{', '.join(paper['authors'])} ({paper['year']}). {paper['title']}. {paper['journal']}."
            else:
                citation = f"{', '.join(paper['authors'])}. \"{paper['title']}.\" {paper['journal']}, {paper['year']}."
            citations.append({"paper_id": paper_id, "citation": citation})
    return {"citations": citations}

@app.get("/")
async def root():
    return {
        "message": "Welcome to AutoScholar API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)