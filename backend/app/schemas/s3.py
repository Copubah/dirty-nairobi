from pydantic import BaseModel, Field, validator
import re

class PresignedUrlRequest(BaseModel):
    """Schema for requesting a pre-signed URL."""
    filename: str = Field(..., min_length=1, max_length=255, description="Original filename")
    content_type: str = Field(..., description="MIME type of the file")
    
    @validator('filename')
    def validate_filename(cls, v):
        if not v or not v.strip():
            raise ValueError('Filename cannot be empty')
        
        # Remove any path components for security
        filename = v.strip().split('/')[-1].split('\\')[-1]
        
        # Basic filename validation
        if not re.match(r'^[a-zA-Z0-9._-]+$', filename):
            raise ValueError('Filename contains invalid characters')
        
        return filename
    
    @validator('content_type')
    def validate_content_type(cls, v):
        allowed_types = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ]
        
        if v.lower() not in allowed_types:
            raise ValueError(f'Content type must be one of: {", ".join(allowed_types)}')
        
        return v.lower()

class PresignedUrlResponse(BaseModel):
    """Schema for pre-signed URL response."""
    upload_url: str = Field(..., description="Pre-signed URL for uploading")
    s3_key: str = Field(..., description="S3 object key")
    expires_in: int = Field(3600, description="URL expiration time in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "upload_url": "https://s3.amazonaws.com/bucket/key?signature=...",
                "s3_key": "photos/2023/12/uuid-filename.jpg",
                "expires_in": 3600
            }
        }