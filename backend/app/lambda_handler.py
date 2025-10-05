"""
Lambda handler for AWS Lambda deployment
"""
from mangum import Mangum
from app.main import app

# Create the Lambda handler
handler = Mangum(app, lifespan="off")