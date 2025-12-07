#!/bin/bash

# Minimal AWS S3 Setup for Dirty Nairobi
# This script sets up S3 bucket with minimal cost configuration

set -e

# Configuration
BUCKET_NAME="dirty-nairobi-photos-$(date +%Y%m%d)"
REGION="us-east-1"
USER_NAME="dirty-nairobi-s3-user"
POLICY_NAME="DirtyNairobiS3Policy"

echo "Setting up AWS S3 for Dirty Nairobi..."
echo "Bucket name: $BUCKET_NAME"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo " AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo " Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION

echo " Setting up bucket policy..."
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

echo " Setting up CORS..."
cat > /tmp/cors.json << EOF
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

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file:///tmp/cors.json

echo " Creating IAM policy..."
cat > /tmp/s3-policy.json << EOF
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
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::$BUCKET_NAME"
        }
    ]
}
EOF

aws iam create-policy --policy-name $POLICY_NAME --policy-document file:///tmp/s3-policy.json

echo " Creating IAM user..."
aws iam create-user --user-name $USER_NAME

echo " Attaching policy to user..."
aws iam attach-user-policy --user-name $USER_NAME --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME

echo " Creating access keys..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name $USER_NAME)
ACCESS_KEY_ID=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')

# Clean up temp files
rm /tmp/bucket-policy.json /tmp/cors.json /tmp/s3-policy.json

echo ""
echo " Setup complete!"
echo ""
echo " Configuration for Railway:"
echo "AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"
echo "AWS_REGION=$REGION"
echo "S3_BUCKET_NAME=$BUCKET_NAME"
echo ""
echo "Estimated monthly cost: \$0.50-2.00"
echo "S3 Console: https://s3.console.aws.amazon.com/s3/buckets/$BUCKET_NAME"
echo ""
echo " IMPORTANT: Save these credentials securely!"
echo "   Add them to your Railway environment variables."