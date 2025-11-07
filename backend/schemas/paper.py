# app/schemas/paper.py
from pydantic import BaseModel
from typing import List, Optional

class PaperSchema(BaseModel):
    id: int
    title: str
    abstract: Optional[str]
    doi: Optional[str]
    url: Optional[str]
    pdf_url: Optional[str]
    publication_date: Optional[str]
    journal: Optional[str]
    volume: Optional[str]
    issue: Optional[str]
    pages: Optional[str]
    publisher: Optional[str]
    citation_count: Optional[int]
    keywords: Optional[List[str]] = []
    auto_tags: Optional[List[str]] = []
    ai_summary: Optional[str]
    extra_metadata: Optional[dict]

    class Config:
        orm_mode = True
