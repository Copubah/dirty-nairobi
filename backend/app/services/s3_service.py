import os
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Check if we're in local development mode
IS_LOCAL_DEV = (
    settings.aws_access_key_id == "test-key" or 
    "sqlite" in settings.database_url.lower() or
    not settings.aws_access_key_id or
    not settings.aws_secret_access_key
)

if IS_LOCAL_DEV:
    from app.services.mock_s3_service import MockS3Service as S3ServiceImpl
    logger.info("Using Mock S3 Service for local development")
else:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    from datetime import datetime
    import uuid
    
    class S3ServiceImpl:
        """Service for handling AWS S3 operations."""
        
        def __init__(self):
            """Initialize S3 client."""
            try:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                    region_name=settings.aws_region
                )
                self.bucket_name = settings.s3_bucket_name
                logger.info(f"AWS S3 Service initialized for bucket: {self.bucket_name}")
            except NoCredentialsError:
                logger.error("AWS credentials not found")
                raise ValueError("AWS credentials not configured")
        
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
            """Generate a pre-signed URL for uploading to S3."""
            try:
                presigned_url = self.s3_client.generate_presigned_url(
                    'put_object',
                    Params={
                        'Bucket': self.bucket_name,
                        'Key': s3_key,
                        'ContentType': content_type,
                    },
                    ExpiresIn=expires_in
                )
                return presigned_url
            except ClientError as e:
                logger.error(f"Error generating pre-signed URL: {e}")
                raise ValueError(f"Failed to generate upload URL: {str(e)}")
        
        def get_public_url(self, s3_key: str) -> str:
            """Get the public URL for an S3 object."""
            return f"https://{self.bucket_name}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"
        
        def delete_object(self, s3_key: str) -> bool:
            """Delete an object from S3."""
            try:
                self.s3_client.delete_object(
                    Bucket=self.bucket_name,
                    Key=s3_key
                )
                logger.info(f"Deleted S3 object: {s3_key}")
                return True
            except ClientError as e:
                logger.error(f"Error deleting S3 object {s3_key}: {e}")
                return False
        
        def check_bucket_exists(self) -> bool:
            """Check if the S3 bucket exists and is accessible."""
            try:
                self.s3_client.head_bucket(Bucket=self.bucket_name)
                return True
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == '404':
                    logger.error(f"Bucket {self.bucket_name} does not exist")
                elif error_code == '403':
                    logger.error(f"Access denied to bucket {self.bucket_name}")
                else:
                    logger.error(f"Error accessing bucket {self.bucket_name}: {e}")
                return False
    
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
        """Generate a pre-signed URL for uploading to S3."""
        try:
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key,
                    'ContentType': content_type,
                },
                ExpiresIn=expires_in
            )
            return presigned_url
        except ClientError as e:
            logger.error(f"Error generating pre-signed URL: {e}")
            raise ValueError(f"Failed to generate upload URL: {str(e)}")
    
    def get_public_url(self, s3_key: str) -> str:
        """Get the public URL for an S3 object."""
        return f"https://{self.bucket_name}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"
    
    def delete_object(self, s3_key: str) -> bool:
        """Delete an object from S3."""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            logger.info(f"Deleted S3 object: {s3_key}")
            return True
        except ClientError as e:
            logger.error(f"Error deleting S3 object {s3_key}: {e}")
            return False
    
    def check_bucket_exists(self) -> bool:
        """Check if the S3 bucket exists and is accessible."""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            return True
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                logger.error(f"Bucket {self.bucket_name} does not exist")
            elif error_code == '403':
                logger.error(f"Access denied to bucket {self.bucket_name}")
            else:
                logger.error(f"Error accessing bucket {self.bucket_name}: {e}")
            return False

# Create a singleton instance
s3_service = S3ServiceImpl()