from sqlalchemy import Column, String, Boolean, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY

from .base import Base, BaseModel

# Association table for user research interests
user_interests = Table(
    'user_interests',
    Base.metadata,
    Column('user_id', ForeignKey('users.id'), primary_key=True),
    Column('topic_id', ForeignKey('topics.id'), primary_key=True)
)

class User(Base, BaseModel):
    """User model for authentication and personalization"""
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    bio = Column(Text)
    institution = Column(String(255))
    profile_image = Column(String(255))
    
    # Relationships
    saved_papers = relationship("SavedPaper", back_populates="user")
    search_history = relationship("SearchHistory", back_populates="user")
    paper_views = relationship("PaperView", back_populates="user")
    interests = relationship("Topic", secondary=user_interests, back_populates="interested_users")
    
    # User preferences
    notification_preferences = Column(ARRAY(String), default=["email", "web"])
    search_preferences = Column(ARRAY(String), default=["semantic", "keyword"])
    
    def __repr__(self):
        return f"<User {self.username}>"