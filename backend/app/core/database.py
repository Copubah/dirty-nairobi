from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # Set to True for SQL query logging in development
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables in the database."""
    from app.models.photo import Base, Photo  # Import all models
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all tables in the database."""
    from app.models.photo import Base
    Base.metadata.drop_all(bind=engine)