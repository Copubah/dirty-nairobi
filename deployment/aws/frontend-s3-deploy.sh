#!/bin/bash

# Dirty Nairobi Frontend Deployment Script for AWS S3 + CloudFront
# This script builds and deploys the React frontend to S3 with CloudFront distribution

set -e

echo "🚀 Starting Dirty Nairobi Frontend Deployment..."

# Configuration - Update these values
S3_BUCKET_NAME="dirty-nairobi-frontend"
CLOUDFRONT_DISTRIBUTION_ID=""  # Set this after creating CloudFront distribution
AWS_REGION="us-east-1"
API_URL="https://your-api-gateway-url.amazonaws.com/prod"  # Update with your API URL

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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install AWS CLI first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to frontend directory
cd ../frontend

# Create environment file for production
print_status "Creating production environment file..."
cat > .env.production << EOF
REACT_APP_API_URL=$API_URL
GENERATE_SOURCEMAP=false
EOF

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Build the application
print_status "Building React application..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    print_error "Build failed! Build directory not found."
    exit 1
fi

# Create S3 bucket if it doesn't exist
print_status "Checking if S3 bucket exists..."
if ! aws s3 ls "s3://$S3_BUCKET_NAME" 2>/dev/null; then
    print_status "Creating S3 bucket: $S3_BUCKET_NAME"
    aws s3 mb "s3://$S3_BUCKET_NAME" --region $AWS_REGION
    
    # Configure bucket for static website hosting
    print_status "Configuring S3 bucket for static website hosting..."
    aws s3 website "s3://$S3_BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html
    
    # Set bucket policy for public read access
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket $S3_BUCKET_NAME \
        --policy file://bucket-policy.json
    
    rm bucket-policy.json
else
    print_status "S3 bucket already exists: $S3_BUCKET_NAME"
fi

# Sync build files to S3
print_status "Uploading files to S3..."
aws s3 sync build/ "s3://$S3_BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload HTML files with shorter cache
aws s3 sync build/ "s3://$S3_BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=3600" \
    --exclude "*" \
    --include "*.html" \
    --include "service-worker.js" \
    --include "manifest.json"

# Set correct content type for CSS and JS files
print_status "Setting content types..."
aws s3 cp "s3://$S3_BUCKET_NAME" "s3://$S3_BUCKET_NAME" \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --metadata-directive REPLACE

aws s3 cp "s3://$S3_BUCKET_NAME" "s3://$S3_BUCKET_NAME" \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

# Get S3 website URL
S3_WEBSITE_URL="http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

print_status "✅ Frontend deployed successfully!"
print_status "S3 Website URL: $S3_WEBSITE_URL"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_status "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*"
    print_status "✅ CloudFront cache invalidated!"
else
    print_warning "CloudFront distribution ID not provided. Skipping cache invalidation."
    print_warning "To set up CloudFront:"
    echo "  1. Create a CloudFront distribution pointing to: $S3_WEBSITE_URL"
    echo "  2. Update CLOUDFRONT_DISTRIBUTION_ID in this script"
    echo "  3. Re-run deployment to enable cache invalidation"
fi

echo ""
print_status "Deployment Summary:"
echo "  S3 Bucket: $S3_BUCKET_NAME"
echo "  Website URL: $S3_WEBSITE_URL"
echo "  API URL: $API_URL"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "  CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
fi

echo ""
print_status "Next Steps:"
echo "  1. Test the application at: $S3_WEBSITE_URL"
echo "  2. Set up CloudFront distribution for better performance and HTTPS"
echo "  3. Configure custom domain name if needed"
echo "  4. Set up monitoring and alerts"