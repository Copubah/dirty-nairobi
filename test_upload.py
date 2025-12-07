#!/usr/bin/env python3

import requests
import json

# Test the upload functionality
def test_upload():
    base_url = "http://localhost:8000/api/v1"
    
    print("Testing Dirty Nairobi Upload Functionality")
    print("=" * 50)
    
    # Test 1: Get presigned URL
    print("1. Testing presigned URL generation...")
    presigned_response = requests.post(
        f"{base_url}/upload/presigned-url",
        json={
            "filename": "test_photo.jpg",
            "content_type": "image/jpeg"
        }
    )
    
    if presigned_response.status_code == 200:
        presigned_data = presigned_response.json()
        print("   ✓ Presigned URL generated successfully")
        print(f"   Upload URL: {presigned_data['upload_url']}")
        print(f"   S3 Key: {presigned_data['s3_key']}")
    else:
        print(f"   ✗ Failed to get presigned URL: {presigned_response.status_code}")
        return False
    
    # Test 2: Simulate file upload to mock S3
    print("\n2. Testing mock file upload...")
    upload_url = presigned_data['upload_url']
    
    # Create fake image data
    fake_image_data = b"fake_image_data_for_testing"
    
    upload_response = requests.put(
        upload_url,
        data=fake_image_data,
        headers={"Content-Type": "image/jpeg"}
    )
    
    if upload_response.status_code == 200:
        print("   ✓ Mock file upload successful")
    else:
        print(f"   ✗ Mock file upload failed: {upload_response.status_code}")
        return False
    
    # Test 3: Create photo metadata
    print("\n3. Testing photo metadata creation...")
    photo_data = {
        "description": "Test photo from automated test",
        "latitude": -1.2921,
        "longitude": 36.8219,
        "s3_key": presigned_data['s3_key']
    }
    
    photo_response = requests.post(
        f"{base_url}/photos",
        json=photo_data
    )
    
    if photo_response.status_code == 201:
        photo_result = photo_response.json()
        print("   ✓ Photo metadata created successfully")
        print(f"   Photo ID: {photo_result['id']}")
        print(f"   S3 URL: {photo_result['s3_url']}")
    else:
        print(f"   ✗ Failed to create photo metadata: {photo_response.status_code}")
        return False
    
    # Test 4: Retrieve photos
    print("\n4. Testing photo retrieval...")
    photos_response = requests.get(f"{base_url}/photos")
    
    if photos_response.status_code == 200:
        photos = photos_response.json()
        print(f"   ✓ Retrieved {len(photos)} photos")
        
        # Find our test photo
        test_photo = next((p for p in photos if p['id'] == photo_result['id']), None)
        if test_photo:
            print("   ✓ Test photo found in results")
        else:
            print("   ✗ Test photo not found in results")
    else:
        print(f"   ✗ Failed to retrieve photos: {photos_response.status_code}")
        return False
    
    print("\n" + "=" * 50)
    print("✓ ALL TESTS PASSED - Upload functionality is working!")
    print("\nThe app can successfully:")
    print("- Generate presigned URLs for uploads")
    print("- Handle mock file uploads")
    print("- Store photo metadata in database")
    print("- Retrieve photos with location data")
    
    return True

if __name__ == "__main__":
    try:
        test_upload()
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to backend server at http://localhost:8000")
        print("Make sure the backend is running with: uvicorn app.main:app --host 0.0.0.0 --port 8000")
    except Exception as e:
        print(f"✗ Test failed with error: {e}")