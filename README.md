# Dirty Nairobi

A crowdsourced environmental reporting platform for Nairobi

Dirty Nairobi is a full-stack web application that enables citizens to report and visualize littered or dirty places in Nairobi through geotagged photo uploads. The platform features an interactive map with smart location search, real-time filtering, and responsive design for both mobile and desktop users.

## Features

### Core Functionality
- **Photo Upload**: Secure image uploads with drag-and-drop interface
- **Interactive Map**: Leaflet-powered map with marker clustering
- **Smart Location Search**: Type location names instead of coordinates
- **Real-time Filtering**: Search and filter reports by description
- **Responsive Design**: Optimized for mobile and desktop devices

### Technical Features
- **Real-time Updates**: Automatic map refresh after uploads
- **Secure Storage**: AWS S3 integration with pre-signed URLs
- **Modern UI**: Clean, intuitive interface with loading states
- **Location Intelligence**: OpenStreetMap integration for Nairobi
- **Data Validation**: Coordinate bounds checking for Nairobi area

## Architecture

### **Frontend (React.js)**
- Modern React with hooks and functional components
- Leaflet for interactive mapping with marker clustering
- Axios for API communication
- Real-time location search with OpenStreetMap Nominatim
- Responsive CSS with mobile-first design

### **Backend (FastAPI)**
- RESTful API with automatic OpenAPI documentation
- SQLAlchemy ORM with PostgreSQL/SQLite support
- Pydantic for data validation and serialization
- AWS S3 integration for secure file uploads
- CORS configuration for cross-origin requests

### **Storage & Database**
- **Images**: AWS S3 with pre-signed URLs for security
- **Metadata**: PostgreSQL (production) / SQLite (development)
- **Caching**: Optimized queries with database indexing

## Quick Start

### Prerequisites
- Python 3.9+ 
- Node.js 18+
- PostgreSQL (for production) or SQLite (for development)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/dirty-nairobi.git
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

# Start the server
uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000

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

## Usage

### Reporting Environmental Issues
1. **Upload Photo**: Drag and drop or select an image
2. **Add Description**: Describe the environmental issue
3. **Set Location**: 
   - Type location name (e.g., "Westlands", "CBD")
   - Or use "Get Current Location" for GPS
4. **Submit Report**: Photo and metadata are saved securely

### Viewing Reports
1. **Interactive Map**: View all reports with clustered markers
2. **Filter Reports**: Use search box to filter by description
3. **View Details**: Click markers to see photo and location info
4. **Navigate**: Zoom and pan to explore different areas

## Development

### Project Structure
```
dirty-nairobi/
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
- `POST /api/v1/upload/presigned-url` - Generate secure upload URL
- `POST /api/v1/photos` - Save photo metadata
- `GET /api/v1/photos` - Fetch photos with optional filtering
- `GET /api/v1/health` - Health check endpoint

### Environment Variables

Backend (.env):
```env
DATABASE_URL=sqlite:///./dirty_nairobi.db
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_bucket_name
BACKEND_CORS_ORIGINS=http://localhost:3000
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## Deployment

### Quick Deploy Options

Option 1: Netlify + Railway
- Frontend: Deploy to Netlify (drag build folder)
- Backend: Deploy to Railway.app (connect GitHub)

Option 2: Vercel + Heroku
- Frontend: Deploy to Vercel (drag build folder)
- Backend: Deploy to Heroku (git push)

Option 3: AWS (Full Stack)
- Frontend: AWS Amplify
- Backend: AWS Lambda + API Gateway
- Database: AWS RDS
- Storage: AWS S3

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
pip install -r requirements.txt
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing
1. Upload photos with different locations
2. Test location search with Nairobi areas
3. Verify map clustering with multiple photos
4. Test filtering and search functionality

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Development Guidelines**
- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript code
- Write tests for new features
- Update documentation for API changes

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **OpenStreetMap** for location data and mapping services
- **Leaflet** for the interactive mapping library
- **FastAPI** for the modern Python web framework
- **React** for the frontend framework
- **AWS** for cloud infrastructure services

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/yourusername/dirty-nairobi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dirty-nairobi/discussions)
- **Email**: your.email@example.com

## 🗺️ **Roadmap**

### **Phase 1: Core Features** ✅
- [x] Photo upload with location
- [x] Interactive map with clustering
- [x] Location search functionality
- [x] Real-time filtering

### **Phase 2: Enhanced Features** 🚧
- [ ] User authentication and profiles
- [ ] Photo categories (plastic, organic, etc.)
- [ ] Admin dashboard for moderation
- [ ] Mobile app (React Native)

### **Phase 3: Advanced Features** 📋
- [ ] AI-powered image analysis
- [ ] Integration with city services
- [ ] Gamification and rewards
- [ ] Multi-language support

---

**Made with ❤️ for a cleaner Nairobi**