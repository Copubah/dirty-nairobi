from sqlalchemy import Column, String, Text, Numeric, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Photo(Base):
    """Photo model for storing uploaded photo metadata."""
    
    __tablename__ = "photos"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    s3_key = Column(String(255), nullable=False, index=True)
    s3_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Indexes for performance optimization (SQLite compatible)
    __table_args__ = (
        Index('idx_photos_location', 'latitude', 'longitude'),
        Index('idx_photos_created_at', 'created_at'),
        Index('idx_photos_description', 'description'),
    )
    
    def __repr__(self):
        return f"<Photo(id={self.id}, description='{self.description[:50]}...', lat={self.latitude}, lng={self.longitude})>"