#!/bin/bash

# Dirty Nairobi Development Startup Script
# This script helps you get the application running quickly in development mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the dirty-nairobi root directory"
    exit 1
fi

print_header "🚀 Starting Dirty Nairobi Development Environment"
echo ""

# Check prerequisites
print_status "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

print_status " All prerequisites found!"
echo ""

# Start PostgreSQL database
print_header "Starting PostgreSQL Database"
print_status "Starting PostgreSQL container..."

cd backend
if docker-compose up -d postgres; then
    print_status " PostgreSQL started successfully!"
    print_status "Waiting for database to be ready..."
    sleep 5
else
    print_error "Failed to start PostgreSQL"
    exit 1
fi

# Set up backend environment
print_status "Setting up backend environment..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "  Please update the .env file with your AWS credentials before running the backend!"
fi

cd ..

# Function to start backend
start_backend() {
    print_header " Starting FastAPI Backend"
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    print_status "Activating virtual environment and installing dependencies..."
    source venv/bin/activate
    
    # Try to install dependencies
    if pip install -r requirements.txt; then
        print_status "Dependencies installed successfully!"
        
        print_status "Starting FastAPI server..."
        print_status "Backend will be available at: http://localhost:8000"
        print_status "API Documentation: http://localhost:8000/docs"
        echo ""
        
        # Start the server
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    else
        print_error "Failed to install Python dependencies."
        print_warning "You may need to install system dependencies:"
        print_warning "  sudo apt install -y libpq-dev python3-dev build-essential"
        print_warning "Then try running this script again."
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_header "⚛️  Starting React Frontend"
    cd frontend
    
    print_status "Installing Node.js dependencies..."
    if npm install; then
        print_status " Dependencies installed successfully!"
        
        print_status "Starting React development server..."
        print_status "Frontend will be available at: http://localhost:3000"
        echo ""
        
        # Start the development server
        npm start
    else
        print_error "Failed to install Node.js dependencies."
        exit 1
    fi
}

# Ask user what to start
echo ""
print_header " What would you like to start?"
echo "1) Backend only (FastAPI)"
echo "2) Frontend only (React)"
echo "3) Both (in separate terminals)"
echo "4) Show manual instructions"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        start_backend
        ;;
    2)
        start_frontend
        ;;
    3)
        print_status "Starting both services..."
        print_warning "Backend and frontend will start in separate terminal windows."
        print_warning "Make sure you have the backend running before starting the frontend."
        echo ""
        
        # Start backend in background
        print_status "Starting backend in a new terminal..."
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd backend && source venv/bin/activate && uvicorn app.main:app --reload; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd backend && source venv/bin/activate && uvicorn app.main:app --reload; exec bash" &
        else
            print_warning "Could not detect terminal. Please start backend manually:"
            print_warning "  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
        fi
        
        sleep 3
        
        # Start frontend
        print_status "Starting frontend..."
        start_frontend
        ;;
    4)
        print_header "📋 Manual Setup Instructions"
        echo ""
        print_status "1. Start PostgreSQL:"
        echo "   cd backend && docker-compose up -d postgres"
        echo ""
        print_status "2. Set up backend environment:"
        echo "   cd backend"
        echo "   cp .env.example .env  # Update with your AWS credentials"
        echo "   python3 -m venv venv"
        echo "   source venv/bin/activate"
        echo "   pip install -r requirements.txt"
        echo "   uvicorn app.main:app --reload"
        echo ""
        print_status "3. Set up frontend (in another terminal):"
        echo "   cd frontend"
        echo "   npm install"
        echo "   npm start"
        echo ""
        print_status "4. Access the application:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:8000"
        echo "   API Docs: http://localhost:8000/docs"
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac