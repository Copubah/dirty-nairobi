# 🚀 AWS Deployment Guide for Dirty Nairobi

## ✅ **Prerequisites**

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **SAM CLI** installed (for serverless deployment)
4. **Node.js** and **Python** installed locally

## 🎯 **Deployment Options**

### **Option 1: Serverless (Recommended)**
- **Backend**: AWS Lambda + API Gateway
- **Frontend**: AWS Amplify
- **Database**: AWS RDS (PostgreSQL)
- **Storage**: AWS S3

### **Option 2: Traditional**
- **Backend**: AWS EC2
- **Frontend**: S3 + CloudFront
- **Database**: AWS RDS (PostgreSQL)
- **Storage**: AWS S3

---

## 🚀 **Quick Serverless Deployment**

### **Step 1: Set Up AWS Resources**

#### **1.1 Create S3 Bucket**
```bash
# Replace 'your-unique-bucket-name' with your actual bucket name
aws s3 mb s3://dirty-nairobi-photos-prod --region us-east-1

# Set up CORS
aws s3api put-bucket-cors --bucket dirty-nairobi-photos-prod --cors-configuration file://deployment/aws/s3-cors.json

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
            "Resource": "arn:aws:s3:::dirty-nairobi-photos-prod/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket dirty-nairobi-photos-prod --policy file://bucket-policy.json
rm bucket-policy.json
```

#### **1.2 Create RDS Database**
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
    --backup-retention-period 7 \
    --storage-encrypted \
    --publicly-accessible
```

### **Step 2: Deploy Backend (Lambda)**

#### **2.1 Install SAM CLI**
```bash
# macOS
brew install aws-sam-cli

# Linux
pip install aws-sam-cli
```

#### **2.2 Deploy with SAM**
```bash
cd deployment/aws

# Build the application
sam build -t lambda-deploy.yml

# Deploy (first time - interactive)
sam deploy --guided \
    --template-file lambda-deploy.yml \
    --stack-name dirty-nairobi-backend \
    --parameter-overrides \
        Environment=prod \
        DatabaseUrl="postgresql://postgres:YourSecurePassword123@your-rds-endpoint:5432/dirty_nairobi" \
        S3BucketName="dirty-nairobi-photos-prod" \
        CorsOrigins="https://yourdomain.com"

# Subsequent deployments
sam deploy
```

### **Step 3: Deploy Frontend (Amplify)**

#### **3.1 Connect to Amplify**
1. Go to **AWS Amplify Console**
2. Click **"New app"** > **"Host web app"**
3. Connect your **Git repository**
4. Select the **main branch**

#### **3.2 Configure Build Settings**
Use the provided `deployment/aws/amplify.yml` or configure in console:

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

#### **3.3 Set Environment Variables**
In Amplify Console > App settings > Environment variables:

```
REACT_APP_API_URL = https://your-api-gateway-url.amazonaws.com/prod
```

---

## 🔧 **Configuration Steps**

### **Backend Configuration**

1. **Update `.env.production`**:
```bash
cd backend
cp .env.production .env
# Edit .env with your actual values:
# - RDS endpoint
# - S3 bucket name
# - AWS credentials
# - Production domain
```

2. **Database Migration**:
```bash
# After RDS is created, run migrations
python3 -c "from app.core.database import create_tables; create_tables()"
```

### **Frontend Configuration**

1. **Update API URL**:
```bash
cd frontend
echo "REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/prod" > .env.production
```

---

## 📋 **Post-Deployment Checklist**

### **✅ Backend Verification**
- [ ] Lambda function deployed successfully
- [ ] API Gateway endpoints responding
- [ ] Database connection working
- [ ] S3 bucket accessible
- [ ] CORS configured properly

### **✅ Frontend Verification**
- [ ] Amplify app deployed successfully
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] API integration working

### **✅ Application Testing**
- [ ] Photo upload functionality
- [ ] Location search working
- [ ] Map display functional
- [ ] Search/filter features
- [ ] Mobile responsiveness

---

## 🔒 **Security Configuration**

### **IAM Roles & Permissions**
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
            "Resource": "arn:aws:s3:::dirty-nairobi-photos-prod/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "rds:DescribeDBInstances"
            ],
            "Resource": "*"
        }
    ]
}
```

### **Environment Variables Security**
- Store sensitive values in **AWS Systems Manager Parameter Store**
- Use **AWS Secrets Manager** for database credentials
- Never commit real credentials to version control

---

## 💰 **Cost Estimation**

### **Monthly Costs (Approximate)**
- **Lambda**: $0-5 (first 1M requests free)
- **API Gateway**: $3.50 per million requests
- **RDS t3.micro**: $13-15/month
- **S3**: $0.023 per GB stored
- **Amplify**: $0.01 per build minute
- **Data Transfer**: $0.09 per GB

**Total estimated cost**: $20-30/month for moderate usage

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**:
   - Check API Gateway CORS settings
   - Verify frontend domain in CORS origins

2. **Database Connection**:
   - Check RDS security groups
   - Verify connection string format

3. **S3 Upload Failures**:
   - Check bucket permissions
   - Verify IAM role has S3 access

4. **Lambda Cold Starts**:
   - Consider provisioned concurrency
   - Optimize function memory allocation

---

## 📞 **Support**

If you encounter issues:
1. Check AWS CloudWatch logs
2. Review the troubleshooting section in `DEPLOYMENT.md`
3. Verify all environment variables are set correctly
4. Test each component individually

---

## 🎉 **Success!**

Once deployed, your Dirty Nairobi application will be:
- **Scalable**: Handles traffic spikes automatically
- **Secure**: AWS-managed security and encryption
- **Cost-effective**: Pay only for what you use
- **Reliable**: 99.9% uptime SLA

**Your app will be live at**: `https://your-amplify-domain.amplifyapp.com`