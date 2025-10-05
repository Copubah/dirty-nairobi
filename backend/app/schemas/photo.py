from pydantic import BaseModel, Field, validator
from datetime import datetime
from uuid import UUID
from typing import Optional
from decimal import Decimal

class PhotoBase(BaseModel):
    """Base photo schema with common fields."""
    description: str = Field(..., min_length=1, max_length=1000, description="Description of the photo")
    latitude: float = Field(..., ge=-1.5, le=-1.0, description="Latitude coordinate (Nairobi bounds)")
    longitude: float = Field(..., ge=36.5, le=37.2, description="Longitude coordinate (Nairobi bounds)")

class PhotoCreate(PhotoBase):
    """Schema for creating a new photo."""
    s3_key: str = Field(..., min_length=1, max_length=255, description="S3 object key")
    
    @validator('s3_key')
    def validate_s3_key(cls, v):
        if not v or not v.strip():
            raise ValueError('S3 key cannot be empty')
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if not v or not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()

class PhotoUpdate(BaseModel):
    """Schema for updating a photo."""
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    latitude: Optional[float] = Field(None, ge=-1.5, le=-1.0)
    longitude: Optional[float] = Field(None, ge=36.5, le=37.2)

class PhotoResponse(PhotoBase):
    """Schema for photo response."""
    id: UUID
    s3_url: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PhotoFilter(BaseModel):
    """Schema for filtering photos."""
    description: Optional[str] = Field(None, description="Filter by description (case-insensitive)")
    limit: int = Field(100, ge=1, le=1000, description="Maximum number of results")
    offset: int = Field(0, ge=0, description="Number of results to skip")
    
    @validator('description')
    def validate_description_filter(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v