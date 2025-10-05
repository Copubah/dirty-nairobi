#!/bin/bash

# GitHub Push Script for Dirty Nairobi
# Replace YOUR_USERNAME with your actual GitHub username

echo "🚀 Pushing Dirty Nairobi to GitHub..."

# Add your GitHub repository URL here
# Replace YOUR_USERNAME with your actual GitHub username
GITHUB_USERNAME="YOUR_USERNAME"
REPO_URL="https://github.com/$GITHUB_USERNAME/dirty-nairobi.git"

echo "Setting up remote repository..."
git remote add origin $REPO_URL

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "🌐 Your repository: https://github.com/$GITHUB_USERNAME/dirty-nairobi"
echo ""
echo "🚀 Next steps for deployment:"
echo "1. Go to Vercel.com"
echo "2. Import your GitHub repository"
echo "3. Deploy automatically!"