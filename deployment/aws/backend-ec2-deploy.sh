#!/bin/bash

# Dirty Nairobi Backend Deployment Script for AWS EC2
# This script deploys the FastAPI backend to an EC2 instance

set -e

echo "🚀 Starting Dirty Nairobi Backend Deployment..."

# Configuration
APP_NAME="dirty-nairobi-backend"
DOCKER_IMAGE="$APP_NAME:latest"
CONTAINER_NAME="$APP_NAME-container"
PORT=8000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop and remove existing container
print_status "Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Build the Docker image
print_status "Building Docker image..."
cd ../backend
docker build -t $DOCKER_IMAGE .

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please update the .env file with your actual configuration before running the container."
fi

# Run the container
print_status "Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:8000 \
    --env-file .env \
    $DOCKER_IMAGE

# Wait for container to start
print_status "Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q $CONTAINER_NAME; then
    print_status "✅ Container is running successfully!"
    
    # Test the health endpoint
    if curl -f http://localhost:$PORT/health > /dev/null 2>&1; then
        print_status "✅ Health check passed!"
        print_status "🎉 Deployment completed successfully!"
        print_status "API is available at: http://localhost:$PORT"
        print_status "API Documentation: http://localhost:$PORT/docs"
    else
        print_warning "⚠️  Container is running but health check failed."
        print_warning "Check the logs with: docker logs $CONTAINER_NAME"
    fi
else
    print_error "❌ Container failed to start!"
    print_error "Check the logs with: docker logs $CONTAINER_NAME"
    exit 1
fi

# Show container logs
print_status "Recent container logs:"
docker logs --tail 20 $CONTAINER_NAME

echo ""
print_status "Deployment commands:"
echo "  View logs: docker logs -f $CONTAINER_NAME"
echo "  Stop container: docker stop $CONTAINER_NAME"
echo "  Start container: docker start $CONTAINER_NAME"
echo "  Remove container: docker rm $CONTAINER_NAME"