# app/models/paper.py
from sqlalchemy import Column, String, Integer, Float, Text, Table, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from .base import Base  # ONLY Base, no BaseModel

paper_authors = Table(
    'paper_authors',
    Base.metadata,
    Column('paper_id', ForeignKey('papers.id'), primary_key=True),
    Column('author_id', ForeignKey('authors.id'), primary_key=True)
)

paper_topics = Table(
    'paper_topics',
    Base.metadata,
    Column('paper_id', ForeignKey('papers.id'), primary_key=True),
    Column('topic_id', ForeignKey('topics.id'), primary_key=True)
)

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    abstract = Column(Text)
    doi = Column(String(100), unique=True, index=True)
    url = Column(String(500))
    pdf_url = Column(String(500))
    publication_date = Column(Date)
    journal = Column(String(255))
    volume = Column(String(50))
    issue = Column(String(50))
    pages = Column(String(50))
    publisher = Column(String(255))
    citation_count = Column(Integer, default=0)

    title_embedding = Column(ARRAY(Float))
    abstract_embedding = Column(ARRAY(Float))
    keywords = Column(ARRAY(String))
    auto_tags = Column(ARRAY(String))
    ai_summary = Column(Text)
    extra_metadata = Column(JSONB)  # renamed from 'metadata' to avoid conflict

    authors = relationship("Author", secondary=paper_authors, back_populates="papers")
    topics = relationship("Topic", secondary=paper_topics, back_populates="papers")
    references = relationship("Reference", back_populates="paper")
    views = relationship("PaperView", back_populates="paper")
    saved_by = relationship("SavedPaper", back_populates="paper")

    def __repr__(self):
        return f"<Paper {self.title}>"
