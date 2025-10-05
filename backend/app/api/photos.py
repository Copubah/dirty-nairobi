from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.photo import PhotoCreate, PhotoResponse, PhotoFilter
from app.schemas.s3 import PresignedUrlRequest, PresignedUrlResponse
from app.services.photo_service import photo_service
from app.services.s3_service import s3_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload/presigned-url", response_model=PresignedUrlResponse)
async def generate_presigned_url(request: PresignedUrlRequest):
    """Generate a pre-signed URL for uploading photos to S3."""
    try:
        # Generate unique S3 key
        s3_key = s3_service.generate_s3_key(request.filename)
        
        # Generate pre-signed URL
        upload_url = s3_service.generate_presigned_url(
            s3_key=s3_key,
            content_type=request.content_type,
            expires_in=3600  # 1 hour
        )
        
        return PresignedUrlResponse(
            upload_url=upload_url,
            s3_key=s3_key,
            expires_in=3600
        )
        
    except ValueError as e:
        logger.error(f"Error generating pre-signed URL: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error generating pre-signed URL: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/photos", response_model=PhotoResponse)
async def create_photo(
    photo_data: PhotoCreate,
    db: Session = Depends(get_db)
):
    """Create a new photo record after successful upload."""
    try:
        photo = photo_service.create_photo(db=db, photo_data=photo_data)
        return photo
        
    except ValueError as e:
        logger.error(f"Error creating photo: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error creating photo: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/photos", response_model=List[PhotoResponse])
async def get_photos(
    description: Optional[str] = Query(None, description="Filter by description"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db)
):
    """Get all photos with optional filtering."""
    try:
        filters = PhotoFilter(
            description=description,
            limit=limit,
            offset=offset
        )
        
        photos = photo_service.get_photos(db=db, filters=filters)
        return photos
        
    except Exception as e:
        logger.error(f"Error fetching photos: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/photos/{photo_id}", response_model=PhotoResponse)
async def get_photo(
    photo_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific photo by ID."""
    try:
        photo = photo_service.get_photo(db=db, photo_id=photo_id)
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        return photo
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching photo {photo_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/photos/{photo_id}")
async def delete_photo(
    photo_id: str,
    db: Session = Depends(get_db)
):
    """Delete a photo."""
    try:
        success = photo_service.delete_photo(db=db, photo_id=photo_id)
        if not success:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        return {"message": "Photo deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting photo {photo_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/photos/count")
async def get_photos_count(
    description: Optional[str] = Query(None, description="Filter by description"),
    db: Session = Depends(get_db)
):
    """Get total count of photos matching filters."""
    try:
        filters = PhotoFilter(description=description, limit=1, offset=0)
        count = photo_service.get_photos_count(db=db, filters=filters)
        
        return {"count": count}
        
    except Exception as e:
        logger.error(f"Error counting photos: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Mock endpoints for local development
@router.put("/mock-upload/{s3_key}")
async def mock_s3_upload(s3_key: str, request: Request):
    """Mock S3 upload endpoint for local development."""
    try:
        # Read the uploaded file data
        body = await request.body()
        
        # Create local storage directory if it doesn't exist
        import os
        local_storage_path = "local_photos"
        os.makedirs(local_storage_path, exist_ok=True)
        
        # Save the file locally
        file_path = os.path.join(local_storage_path, s3_key.replace('_', '/'))
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'wb') as f:
            f.write(body)
        
        logger.info(f"Mock S3 upload successful: {s3_key}")
        return {"message": "Upload successful"}
        
    except Exception as e:
        logger.error(f"Mock S3 upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")

@router.get("/mock-photos/{s3_key}")
async def mock_s3_download(s3_key: str):
    """Mock S3 download endpoint for local development."""
    try:
        import os
        from fastapi.responses import FileResponse
        
        local_storage_path = "local_photos"
        file_path = os.path.join(local_storage_path, s3_key.replace('_', '/'))
        
        if os.path.exists(file_path):
            return FileResponse(file_path)
        else:
            raise HTTPException(status_code=404, detail="File not found")
            
    except Exception as e:
        logger.error(f"Mock S3 download failed: {e}")
        raise HTTPException(status_code=404, detail="File not found")