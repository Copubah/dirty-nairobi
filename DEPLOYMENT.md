# Dirty Nairobi Deployment Guide

This guide provides comprehensive instructions for deploying the Dirty Nairobi application to AWS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Setup](#aws-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **AWS CLI** (v2.0+)
- **Docker** (v20.0+)
- **Node.js** (v18+)
- **Python** (v3.11+)
- **Git**

### AWS Account Requirements

- AWS account with appropriate permissions
- AWS CLI configured with credentials
- S3 bucket creation permissions
- Lambda and API Gateway permissions (for serverless deployment)
- EC2 permissions (for container deployment)

## AWS Setup

### 1. Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format
```

### 2. Create S3 Bucket for Photos

```bash
# Replace 'your-unique-bucket-name' with your actual bucket name
aws s3 mb s3://dirty-nairobi-photos-your-unique-suffix --region us-east-1

# Set up CORS configuration
aws s3api put-bucket-cors --bucket dirty-nairobi-photos-your-unique-suffix --cors-configuration file://deployment/aws/s3-cors.json
```

### 3. Set up PostgreSQL Database

#### Option A: AWS RDS (Recommended for production)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier dirty-nairobi-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password YourSecurePassword123 \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --storage-encrypted
```

#### Option B: Local PostgreSQL (Development)

```bash
# Using Docker
docker run -d \
    --name dirty-nairobi-postgres \
    -e POSTGRES_DB=dirty_nairobi \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 \
    postgres:15
```

## Backend Deployment

### Option 1: AWS Lambda (Serverless - Recommended)

#### 1. Install SAM CLI

```bash
# macOS
brew install aws-sam-cli

# Linux
pip install aws-sam-cli
```

#### 2. Add Mangum dependency

```bash
cd backend
echo "mangum==0.17.0" >> requirements.txt
```

#### 3. Deploy using SAM

```bash
cd deployment/aws

# Build the application
sam build -t lambda-deploy.yml

# Deploy (first time)
sam deploy --guided \
    --template-file lambda-deploy.yml \
    --stack-name dirty-nairobi-backend \
    --parameter-overrides \
        Environment=prod \
        DatabaseUrl="postgresql://username:password@your-rds-endpoint:5432/dirty_nairobi" \
        S3BucketName="dirty-nairobi-photos-your-unique-suffix" \
        CorsOrigins="https://yourdomain.com"

# Subsequent deployments
sam deploy
```

### Option 2: AWS EC2 (Container-based)

#### 1. Launch EC2 Instance

```bash
# Create security group
aws ec2 create-security-group \
    --group-name dirty-nairobi-sg \
    --description "Security group for Dirty Nairobi backend"

# Add inbound rules
aws ec2 authorize-security-group-ingress \
    --group-name dirty-nairobi-sg \
    --protocol tcp \
    --port 8000 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name dirty-nairobi-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0
```

#### 2. Deploy to EC2

```bash
# Copy deployment script to EC2
scp -i your-key.pem deployment/aws/backend-ec2-deploy.sh ec2-user@your-ec2-ip:~/

# SSH to EC2 and run deployment
ssh -i your-key.pem ec2-user@your-ec2-ip
chmod +x backend-ec2-deploy.sh
./backend-ec2-deploy.sh
```

## Frontend Deployment

### Option 1: AWS Amplify (Recommended)

#### 1. Connect Repository

1. Go to AWS Amplify Console
2. Click "New app" > "Host web app"
3. Connect your Git repository
4. Select the branch to deploy

#### 2. Configure Build Settings

Use the provided `deployment/aws/amplify.yml` file or configure in the console:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
```

#### 3. Set Environment Variables

In Amplify Console > App settings > Environment variables:

```
REACT_APP_API_URL = https://your-api-gateway-url.amazonaws.com/prod
```

### Option 2: S3 + CloudFront

#### 1. Run Deployment Script

```bash
cd deployment/aws

# Update configuration in frontend-s3-deploy.sh
# - S3_BUCKET_NAME
# - API_URL
# - AWS_REGION

chmod +x frontend-s3-deploy.sh
./frontend-s3-deploy.sh
```

#### 2. Set up CloudFront (Optional but recommended)

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

## Database Setup

### 1. Run Migrations

```bash
cd backend

# Install Alembic if not already installed
pip install alembic

# Initialize Alembic (if not done)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head
```

### 2. Create Database Tables

The application will automatically create tables on startup, but you can also run:

```python
from app.core.database import create_tables
create_tables()
```

## Environment Configuration

### Backend Environment Variables

Create `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=dirty-nairobi-photos-your-unique-suffix

# API Configuration
SECRET_KEY=your-super-secret-key-change-in-production
API_V1_STR=/api/v1
PROJECT_NAME=Dirty Nairobi API

# CORS Origins
BACKEND_CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### Frontend Environment Variables

Create `.env.production` file in the frontend directory:

```env
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/prod
GENERATE_SOURCEMAP=false
```

## Monitoring and Maintenance

### 1. CloudWatch Monitoring

Set up CloudWatch alarms for:

- Lambda function errors and duration
- API Gateway 4xx/5xx errors
- S3 bucket size and requests
- RDS CPU and connection count

### 2. Log Management

```bash
# View Lambda logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/dirty-nairobi"

# View API Gateway logs
aws logs describe-log-groups --log-group-name-prefix "API-Gateway-Execution-Logs"
```

### 3. Backup Strategy

- **Database**: RDS automated backups (7-day retention)
- **Photos**: S3 versioning and cross-region replication
- **Code**: Git repository with tags for releases

### 4. Security Updates

- Regularly update dependencies
- Monitor AWS security bulletins
- Review IAM permissions quarterly
- Enable AWS Config for compliance monitoring

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem**: Frontend can't connect to backend due to CORS policy.

**Solution**:
```bash
# Check CORS configuration in backend
# Update BACKEND_CORS_ORIGINS environment variable
# For API Gateway, update CORS settings in AWS Console
```

#### 2. Database Connection Issues

**Problem**: Backend can't connect to PostgreSQL database.

**Solution**:
```bash
# Check database URL format
# Verify security group allows connections on port 5432
# Test connection manually:
psql "postgresql://username:password@host:port/database"
```

#### 3. S3 Upload Failures

**Problem**: Photo uploads fail with permission errors.

**Solution**:
```bash
# Check S3 bucket policy
# Verify IAM role has S3 permissions
# Check bucket CORS configuration
aws s3api get-bucket-cors --bucket your-bucket-name
```

#### 4. Lambda Cold Start Issues

**Problem**: API responses are slow due to Lambda cold starts.

**Solution**:
- Increase Lambda memory allocation
- Use provisioned concurrency for critical functions
- Implement connection pooling for database

### Health Checks

#### Backend Health Check

```bash
curl https://your-api-url/health
# Expected response: {"status": "healthy", "service": "Dirty Nairobi API", "version": "1.0.0"}
```

#### Frontend Health Check

```bash
curl https://your-frontend-url/health
# Expected response: healthy
```

### Performance Optimization

1. **Enable CloudFront caching** for static assets
2. **Use RDS connection pooling** to reduce database load
3. **Implement API response caching** for frequently accessed data
4. **Optimize images** before upload using client-side compression
5. **Use CDN** for Leaflet tiles and other external resources

### Scaling Considerations

- **Lambda**: Automatically scales, monitor concurrent executions
- **RDS**: Consider read replicas for high read traffic
- **S3**: Automatically scales, monitor request patterns
- **CloudFront**: Global edge locations provide automatic scaling

## Support and Maintenance

### Regular Tasks

- **Weekly**: Review CloudWatch metrics and logs
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize AWS costs
- **Annually**: Security audit and penetration testing

### Emergency Procedures

1. **Service Outage**: Check AWS Service Health Dashboard
2. **Data Loss**: Restore from RDS backup or S3 versioning
3. **Security Incident**: Rotate credentials, review access logs
4. **Performance Issues**: Scale resources, check bottlenecks

For additional support, refer to the project repository issues or contact the development team.