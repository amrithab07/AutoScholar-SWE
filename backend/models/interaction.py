from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base, BaseModel

class SavedPaper(Base, BaseModel):
    """Model for papers saved by users"""
    __tablename__ = "saved_papers"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    collection_name = Column(String(100), default="Default")
    notes = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="saved_papers")
    paper = relationship("Paper", back_populates="saved_by")
    
    def __repr__(self):
        return f"<SavedPaper user_id={self.user_id} paper_id={self.paper_id}>"


class SearchHistory(Base, BaseModel):
    """Model for tracking user search history"""
    __tablename__ = "search_history"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    query = Column(String(500), nullable=False)
    filters = Column(JSONB)
    result_count = Column(Integer)
    
    # Relationships
    user = relationship("User", back_populates="search_history")
    
    def __repr__(self):
        return f"<SearchHistory {self.query}>"


class PaperView(Base, BaseModel):
    """Model for tracking paper views by users"""
    __tablename__ = "paper_views"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    view_duration = Column(Integer)  # in seconds
    
    # Relationships
    user = relationship("User", back_populates="paper_views")
    paper = relationship("Paper", back_populates="views")
    
    def __repr__(self):
        return f"<PaperView user_id={self.user_id} paper_id={self.paper_id}>"


class UserFeedback(Base, BaseModel):
    """Model for user feedback on papers and search results"""
    __tablename__ = "user_feedback"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=True)
    search_id = Column(Integer, ForeignKey("search_history.id"), nullable=True)
    rating = Column(Float)  # 1-5 scale
    feedback_text = Column(Text)
    feedback_type = Column(String(50))  # e.g., "relevance", "quality", "recommendation"
    
    # Relationships
    user = relationship("User")
    paper = relationship("Paper")
    search = relationship("SearchHistory")
    
    def __repr__(self):
        return f"<UserFeedback user_id={self.user_id} type={self.feedback_type}>"