from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from app.models.photo import Photo
from app.schemas.photo import PhotoCreate, PhotoUpdate, PhotoFilter
from app.services.s3_service import s3_service
import logging

logger = logging.getLogger(__name__)

class PhotoService:
    """Service for handling photo operations."""
    
    @staticmethod
    def create_photo(db: Session, photo_data: PhotoCreate) -> Photo:
        """Create a new photo record."""
        try:
            # Generate the public S3 URL
            s3_url = s3_service.get_public_url(photo_data.s3_key)
            
            # Create photo instance
            db_photo = Photo(
                s3_key=photo_data.s3_key,
                s3_url=s3_url,
                description=photo_data.description,
                latitude=photo_data.latitude,
                longitude=photo_data.longitude
            )
            
            # Add to database
            db.add(db_photo)
            db.commit()
            db.refresh(db_photo)
            
            logger.info(f"Created photo with ID: {db_photo.id}")
            return db_photo
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating photo: {e}")
            raise ValueError(f"Failed to create photo: {str(e)}")
    
    @staticmethod
    def get_photo(db: Session, photo_id: str) -> Optional[Photo]:
        """Get a photo by ID."""
        return db.query(Photo).filter(Photo.id == photo_id).first()
    
    @staticmethod
    def get_photos(
        db: Session, 
        filters: PhotoFilter
    ) -> List[Photo]:
        """Get photos with optional filtering."""
        query = db.query(Photo)
        
        # Apply description filter if provided
        if filters.description:
            # Case-insensitive search in description
            search_term = f"%{filters.description.lower()}%"
            query = query.filter(
                func.lower(Photo.description).like(search_term)
            )
        
        # Order by creation date (newest first)
        query = query.order_by(Photo.created_at.desc())
        
        # Apply pagination
        query = query.offset(filters.offset).limit(filters.limit)
        
        return query.all()
    
    @staticmethod
    def update_photo(
        db: Session, 
        photo_id: str, 
        photo_update: PhotoUpdate
    ) -> Optional[Photo]:
        """Update a photo."""
        try:
            db_photo = db.query(Photo).filter(Photo.id == photo_id).first()
            if not db_photo:
                return None
            
            # Update fields if provided
            update_data = photo_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_photo, field, value)
            
            db.commit()
            db.refresh(db_photo)
            
            logger.info(f"Updated photo with ID: {photo_id}")
            return db_photo
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating photo {photo_id}: {e}")
            raise ValueError(f"Failed to update photo: {str(e)}")
    
    @staticmethod
    def delete_photo(db: Session, photo_id: str) -> bool:
        """Delete a photo."""
        try:
            db_photo = db.query(Photo).filter(Photo.id == photo_id).first()
            if not db_photo:
                return False
            
            # Delete from S3
            s3_service.delete_object(db_photo.s3_key)
            
            # Delete from database
            db.delete(db_photo)
            db.commit()
            
            logger.info(f"Deleted photo with ID: {photo_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting photo {photo_id}: {e}")
            return False
    
    @staticmethod
    def get_photos_count(db: Session, filters: PhotoFilter) -> int:
        """Get total count of photos matching filters."""
        query = db.query(func.count(Photo.id))
        
        if filters.description:
            search_term = f"%{filters.description.lower()}%"
            query = query.filter(
                func.lower(Photo.description).like(search_term)
            )
        
        return query.scalar()

# Create service instance
photo_service = PhotoService()