"""
Mock S3 service for local development without AWS credentials
"""
import os
import uuid
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class MockS3Service:
    """Mock S3 service for local development."""
    
    def __init__(self):
        """Initialize mock S3 service."""
        self.local_storage_path = "local_photos"
        # Create local storage directory
        os.makedirs(self.local_storage_path, exist_ok=True)
        logger.info("Mock S3 service initialized with local storage")
    
    def generate_s3_key(self, filename: str) -> str:
        """Generate a unique S3 key for the file."""
        # Extract file extension
        file_ext = filename.split('.')[-1] if '.' in filename else 'jpg'
        
        # Create date-based path
        now = datetime.utcnow()
        date_path = f"{now.year}/{now.month:02d}/{now.day:02d}"
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        s3_key = f"photos/{date_path}/{unique_id}.{file_ext}"
        
        return s3_key
    
    def generate_presigned_url(
        self, 
        s3_key: str, 
        content_type: str, 
        expires_in: int = 3600
    ) -> str:
        """Generate a mock pre-signed URL for local testing."""
        # For local testing, return a mock URL that points to our mock upload endpoint
        mock_url = f"http://localhost:8000/api/v1/mock-upload/{s3_key.replace('/', '_')}"
        logger.info(f"Generated mock pre-signed URL: {mock_url}")
        return mock_url
    
    def get_public_url(self, s3_key: str) -> str:
        """Get the mock public URL for a file."""
        # For local testing, return a mock public URL that points to our mock download endpoint
        mock_public_url = f"http://localhost:8000/api/v1/mock-photos/{s3_key.replace('/', '_')}"
        return mock_public_url
    
    def delete_object(self, s3_key: str) -> bool:
        """Mock delete operation."""
        logger.info(f"Mock delete operation for: {s3_key}")
        return True
    
    def check_bucket_exists(self) -> bool:
        """Mock bucket check - always returns True for local testing."""
        return True

# Create a singleton instance for local testing
mock_s3_service = MockS3Service()