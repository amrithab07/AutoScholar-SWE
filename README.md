# AutoScholar

An AI-powered research publication retrieval system that helps researchers find, understand, and cite academic papers.

## Features

- **Hybrid Search**: Combines traditional keyword search (BM25) with semantic vector search for more accurate results
- **AI-Driven Summarization**: Automatically generates concise summaries of research papers
- **Question Answering**: Ask questions about papers and get AI-powered answers
- **Personalized Recommendations**: Discover relevant papers based on your research interests and reading history
- **Citation Management**: Easily generate and export citations in multiple formats (APA, MLA, Chicago, BibTeX)
- **User-Friendly Interface**: Modern, responsive UI built with React and Material UI

## Project Structure

### Backend (Python/FastAPI)

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── ai_features.py    # AI summarization and QA endpoints
│   │   │   ├── citations.py      # Citation formatting endpoints
│   │   │   ├── recommendations.py # Recommendation endpoints
│   │   │   └── search.py         # Search endpoints
│   │   └── ...
│   ├── core/
│   │   └── config.py             # Application configuration
│   ├── models/
│   │   ├── base.py               # Base model class
│   │   ├── interaction.py        # User interaction models
│   │   ├── paper.py              # Research paper models
│   │   └── user.py               # User profile models
│   ├── services/
│   │   ├── ai_features.py        # AI summarization and QA service
│   │   ├── citations.py          # Citation formatting service
│   │   ├── recommendations.py    # Recommendation service
│   │   └── search.py             # Search service (hybrid, keyword, vector)
│   └── ...
└── tests/
    └── ...
```

### Frontend (React/Material UI)

```
frontend/
├── public/
│   └── ...
└── src/
    ├── components/
    │   ├── Footer.jsx            # Footer component
    │   ├── Header.jsx            # Header/navigation component
    │   ├── PaperCard.jsx         # Research paper card component
    │   └── SearchBar.jsx         # Search input component
    ├── pages/
    │   ├── HomePage.jsx          # Landing page
    │   ├── PaperDetailPage.jsx   # Paper details view
    │   ├── SearchResultsPage.jsx # Search results page
    │   └── ...
    ├── App.jsx                   # Main application component with routing
    └── ...
```

## Technology Stack

### Backend
- **Python 3.9+**
- **FastAPI**: Modern, high-performance web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Elasticsearch**: For keyword-based search
- **FAISS**: For efficient vector similarity search
- **Sentence Transformers**: For text embeddings
- **Transformers**: For AI summarization and question answering

### Frontend
- **React 18**: JavaScript library for building user interfaces
- **Material UI**: React component library implementing Material Design
- **React Router**: For navigation and routing
- **Axios**: For API requests

## Getting Started

### Backend Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up Elasticsearch (required for hybrid search)

3. Run the FastAPI server:
   ```
   cd backend
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

## API Endpoints

### Search
- `POST /api/search`: Search for papers with hybrid, keyword, or vector search
- `GET /api/search/autocomplete`: Get search suggestions

### AI Features
- `POST /api/ai/summarize`: Generate summary for a paper
- `POST /api/ai/question`: Ask questions about a paper
- `POST /api/ai/keywords`: Extract keywords from a paper

### Recommendations
- `GET /api/recommendations/{user_id}`: Get personalized paper recommendations
- `GET /api/recommendations/trending`: Get trending papers

### Citations
- `POST /api/citations/format`: Format citations in various styles
- `POST /api/citations/export`: Export citations in different formats

AutoScholar is an AI-powered research publication retrieval system designed to make academic search faster, smarter, and more personalized.

## Features

- 🔍 **Intelligent Retrieval** – Context-aware search using AI
- 📑 **Summarization & Auto-tagging** – Quick insights from research papers
- 🎯 **Personalized Recommendations** – Tailored to user interests and history
- 📚 **Citation Management** – Automated citation exports in multiple formats
- 🌐 **User-Friendly Interface** – Simplified and intuitive for students, scholars, and researchers

## Project Structure

```
autoscolar/
├── backend/              # FastAPI backend
│   ├── app/              # Application code
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Database models
│   │   └── services/     # Business logic
│   ├── tests/            # Backend tests
│   └── requirements.txt  # Python dependencies
├── frontend/             # React frontend
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── package.json      # Node dependencies
│   └── README.md         # Frontend documentation
└── README.md             # Project documentation
```

## Getting Started

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Technologies Used

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Python, FastAPI, SQLAlchemy
- **Search**: Elasticsearch (BM25), FAISS (Vector Search)
- **AI Features**: Hugging Face Transformers, PyTorch
- **Database**: PostgreSQL