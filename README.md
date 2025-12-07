# HaiWork

A crowdsourced environmental reporting platform for Nairobi

HaiWork is a full-stack web application that enables citizens to report and visualize littered or dirty places in Nairobi through geotagged photo uploads. The platform features an interactive map with smart location search, real-time filtering, and responsive design for both mobile and desktop users.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Development](#development)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)
10. [License](#license)

## Features

### Core Functionality
- Photo Upload: Secure image uploads with drag-and-drop interface
- Interactive Map: Leaflet-powered map with marker clustering
- Smart Location Search: Type location names instead of coordinates
- Real-time Filtering: Search and filter reports by description
- Responsive Design: Optimized for mobile and desktop devices

### Technical Features
- Real-time Updates: Automatic map refresh after uploads
- Secure Storage: AWS S3 integration with pre-signed URLs
- Modern UI: Clean, intuitive interface with loading states
- Location Intelligence: OpenStreetMap integration for Nairobi
- Data Validation: Coordinate bounds checking for Nairobi area

## Architecture

### Frontend (React.js)
- Modern React with hooks and functional components
- Leaflet for interactive mapping with marker clustering
- Axios for API communication
- Real-time location search with OpenStreetMap Nominatim
- Responsive CSS with mobile-first design

### Backend (FastAPI)
- RESTful API with automatic OpenAPI documentation
- SQLAlchemy ORM with PostgreSQL/SQLite support
- Pydantic for data validation and serialization
- AWS S3 integration for secure file uploads
- CORS configuration for cross-origin requests

### Storage & Database
- Images: AWS S3 with pre-signed URLs for security
- Metadata: PostgreSQL (production) / SQLite (development)
- Caching: Optimized queries with database indexing

## Quick Start

### Prerequisites
- Python 3.9+ 
- Node.js 18+
- PostgreSQL (for production) or SQLite (for development)
- AWS Account (for S3 storage)

### 1. Clone Repository
```bash
git clone https://github.com/Copubah/dirty-nairobi.git
cd dirty-nairobi
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python3 -c "from app.core.database import create_tables; create_tables()"

# Start the server
uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > .env

# Start development server
npm start
```

Frontend will be available at: http://localhost:3000

### 4. Database Setup

For Development (SQLite):
```bash
# Database will be created automatically
python3 -c "from app.core.database import create_tables; create_tables()"
```

For Production (PostgreSQL):
```bash
# Start PostgreSQL with Docker
cd backend
docker-compose up -d postgres

# Run migrations
python3 -c "from app.core.database import create_tables; create_tables()"
```

## Development

### Project Structure
```
haiwork/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Configuration & database
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic & AWS integration
│   │   └── main.py            # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # React.js frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API integration
│   │   └── styles/            # CSS styling
│   ├── package.json
│   └── Dockerfile
├── deployment/                 # Deployment configurations
│   └── aws/                   # AWS deployment scripts
└── docs/                      # Documentation
```

### API Endpoints
- POST /api/v1/upload/presigned-url - Generate secure upload URL
- POST /api/v1/photos - Save photo metadata
- GET /api/v1/photos - Fetch photos with optional filtering
- GET /api/v1/health - Health check endpoint

### Environment Variables

Backend (.env):
```env
DATABASE_URL=sqlite:///./haiwork.db
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
BACKEND_CORS_ORIGINS=http://localhost:3000
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## Testing

### Test Results Summary

The application has been tested and verified:

#### Backend API Tests
- Server starts successfully on port 8000
- Health endpoint responds correctly
- Database initialization works
- SQLite database created and accessible

#### Upload Flow Tests
- Presigned URL generation works
- Mock S3 upload endpoint responds
- Photo metadata creation successful
- Photo retrieval from database works
- Location data (latitude/longitude) stored correctly

#### API Endpoints Tested
- GET / - Welcome message
- GET /health - Health check
- POST /api/v1/upload/presigned-url - Upload URL generation
- PUT /api/v1/mock-upload/{filename} - Mock file upload
- POST /api/v1/photos - Photo metadata creation
- GET /api/v1/photos - Photo retrieval

### Running Tests

Backend Tests:
```bash
cd backend
pytest
```

Frontend Tests:
```bash
cd frontend
npm test
```

Manual Testing:
1. Upload photos with different locations
2. Test location search with Nairobi areas
3. Verify map clustering with multiple photos
4. Test filtering and search functionality

## Deployment

### Deployment Options

#### Option 1: Minimal Cost Setup (Recommended)
- Frontend: GitHub Pages (FREE)
- Backend: Railway (FREE $5 credits/month)
- Storage: AWS S3 (~$0.50-2/month)
- Database: SQLite on Railway (FREE)
- Total Cost: ~$0.50-2/month

#### Option 2: AWS Serverless
- Frontend: AWS Amplify
- Backend: AWS Lambda + API Gateway
- Database: AWS RDS PostgreSQL
- Storage: AWS S3
- Total Cost: ~$20-30/month

#### Option 3: Traditional AWS
- Frontend: S3 + CloudFront
- Backend: AWS EC2
- Database: AWS RDS PostgreSQL
- Storage: AWS S3
- Total Cost: ~$30-50/month

### Quick Deploy: GitHub Pages + Railway

#### Step 1: Deploy Backend to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
cd dirty-nairobi
railway init
railway up
```

3. Set environment variables in Railway dashboard:
```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket
DATABASE_URL=sqlite:///./photos.db
```

4. Get your backend URL:
```bash
railway domain
```

#### Step 2: Deploy Frontend to GitHub Pages

1. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Select "Deploy from a branch"
   - Select "gh-pages" branch
   - Click Save

2. Update workflow file `.github/workflows/deploy-gh-pages.yml`:
```yaml
REACT_APP_API_URL: https://your-railway-app.railway.app/api/v1
```

3. Push to trigger deployment:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Your app will be live at: https://copubah.github.io/dirty-nairobi

### AWS S3 Setup (Minimal Cost)

#### Create S3 Bucket
```bash
# Configure AWS CLI
aws configure

# Create bucket
aws s3 mb s3://haiwork-photos-2024 --region us-east-1

# Set bucket policy for public read
cat > bucket-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::haiwork-photos-2024/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket haiwork-photos-2024 --policy file://bucket-policy.json

# Enable CORS
cat > cors.json << 'EOF'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket haiwork-photos-2024 --cors-configuration file://cors.json
```

#### Create IAM User
```bash
# Create IAM policy
cat > s3-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::haiwork-photos-2024/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::haiwork-photos-2024"
        }
    ]
}
EOF

aws iam create-policy --policy-name HaiWorkS3Policy --policy-document file://s3-policy.json

# Create user
aws iam create-user --user-name haiwork-s3-user

# Attach policy (replace ACCOUNT-ID)
aws iam attach-user-policy --user-name haiwork-s3-user --policy-arn arn:aws:iam::ACCOUNT-ID:policy/HaiWorkS3Policy

# Create access keys
aws iam create-access-key --user-name haiwork-s3-user
```

Save the Access Key ID and Secret Access Key for Railway configuration.

### AWS Full Deployment

#### Prerequisites
- AWS CLI installed and configured
- SAM CLI installed (for serverless)
- Node.js and Python installed

#### Deploy Backend (Lambda)
```bash
cd deployment/aws

# Build
sam build -t lambda-deploy.yml

# Deploy
sam deploy --guided \
    --template-file lambda-deploy.yml \
    --stack-name haiwork-backend \
    --parameter-overrides \
        Environment=prod \
        DatabaseUrl="postgresql://user:pass@host:5432/db" \
        S3BucketName="haiwork-photos-prod" \
        CorsOrigins="https://yourdomain.com"
```

#### Deploy Frontend (Amplify)
1. Go to AWS Amplify Console
2. Click "New app" > "Host web app"
3. Connect your Git repository
4. Select main branch
5. Set environment variable:
   - REACT_APP_API_URL = https://your-api-gateway-url.amazonaws.com/prod

## Configuration

### Backend Environment Variables

Production (.env):
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=haiwork-photos-prod

# API Configuration
SECRET_KEY=your-super-secret-key-change-in-production
API_V1_STR=/api/v1
PROJECT_NAME=HaiWork API

# CORS Origins
BACKEND_CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### Frontend Environment Variables

Production (.env.production):
```env
REACT_APP_API_URL=https://your-api-url.com/api/v1
GENERATE_SOURCEMAP=false
```

### Security Configuration

IAM Roles & Permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::haiwork-photos-prod/*"
        }
    ]
}
```

Security Best Practices:
- Store sensitive values in AWS Systems Manager Parameter Store
- Use AWS Secrets Manager for database credentials
- Never commit real credentials to version control
- Rotate credentials regularly
- Enable AWS Config for compliance monitoring

## Troubleshooting

### Common Issues

#### CORS Errors
Problem: Frontend can't connect to backend due to CORS policy.

Solution:
- Check CORS configuration in backend
- Update BACKEND_CORS_ORIGINS environment variable
- For API Gateway, update CORS settings in AWS Console

#### Database Connection Issues
Problem: Backend can't connect to PostgreSQL database.

Solution:
- Check database URL format
- Verify security group allows connections on port 5432
- Test connection manually:
```bash
psql "postgresql://username:password@host:port/database"
```

#### S3 Upload Failures
Problem: Photo uploads fail with permission errors.

Solution:
- Check S3 bucket policy
- Verify IAM role has S3 permissions
- Check bucket CORS configuration:
```bash
aws s3api get-bucket-cors --bucket your-bucket-name
```

#### Lambda Cold Start Issues
Problem: API responses are slow due to Lambda cold starts.

Solution:
- Increase Lambda memory allocation
- Use provisioned concurrency for critical functions
- Implement connection pooling for database

### Health Checks

Backend Health Check:
```bash
curl https://your-api-url/health
# Expected: {"status": "healthy", "service": "HaiWork API", "version": "1.0.0"}
```

Frontend Health Check:
```bash
curl https://your-frontend-url/
# Expected: 200 OK
```

### Performance Optimization

1. Enable CloudFront caching for static assets
2. Use RDS connection pooling to reduce database load
3. Implement API response caching for frequently accessed data
4. Optimize images before upload using client-side compression
5. Use CDN for Leaflet tiles and other external resources

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript code
- Write tests for new features
- Update documentation for API changes
- Remove all emojis from code and documentation

## Cost Breakdown

### Minimal Setup (GitHub Pages + Railway + S3)
- GitHub Pages: FREE
- Railway: FREE ($5 credits/month)
- S3 Storage: $0.023 per GB (~$0.50-1/month for 1000 photos)
- S3 Requests: $0.0004 per 1,000 PUT requests
- Total: ~$0.50-2/month

### AWS Serverless Setup
- Lambda: $0-5 (first 1M requests free)
- API Gateway: $3.50 per million requests
- RDS t3.micro: $13-15/month
- S3: $0.023 per GB stored
- Amplify: $0.01 per build minute
- Total: ~$20-30/month

### AWS Traditional Setup
- EC2 t3.micro: $8-10/month
- RDS t3.micro: $13-15/month
- S3: $0.023 per GB stored
- CloudFront: $0.085 per GB
- Total: ~$30-50/month

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenStreetMap for location data and mapping services
- Leaflet for the interactive mapping library
- FastAPI for the modern Python web framework
- React for the frontend framework
- AWS for cloud infrastructure services

## Support

- Issues: [GitHub Issues](https://github.com/Copubah/dirty-nairobi/issues)
- Discussions: [GitHub Discussions](https://github.com/Copubah/dirty-nairobi/discussions)

## Roadmap

### Phase 1: Core Features (Complete)
- [x] Photo upload with location
- [x] Interactive map with clustering
- [x] Location search functionality
- [x] Real-time filtering
- [x] Deployment configurations

### Phase 2: Enhanced Features (Planned)
- [ ] User authentication and profiles
- [ ] Photo categories (plastic, organic, etc.)
- [ ] Admin dashboard for moderation
- [ ] Mobile app (React Native)

### Phase 3: Advanced Features (Future)
- [ ] AI-powered image analysis
- [ ] Integration with city services
- [ ] Gamification and rewards
- [ ] Multi-language support

---

Made for a cleaner Nairobi