from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/dirty_nairobi"
    
    # AWS
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "dirty-nairobi-photos"
    
    # API
    api_v1_str: str = "/api/v1"
    project_name: str = "Dirty Nairobi API"
    
    # CORS
    backend_cors_origins: str = "http://localhost:3000,http://localhost:3001,https://localhost:3000,https://localhost:3001"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 60 * 24 * 8  # 8 days
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()