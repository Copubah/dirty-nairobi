import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`HTTP ${status}:`, data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const photoAPI = {
  // Get pre-signed URL for upload
  getPresignedUrl: async (filename, contentType) => {
    const response = await api.post('/upload/presigned-url', {
      filename,
      content_type: contentType,
    });
    return response.data;
  },

  // Upload file to S3 using pre-signed URL
  uploadToS3: async (presignedUrl, file) => {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    return response;
  },

  // Create photo metadata
  createPhoto: async (photoData) => {
    const response = await api.post('/photos', photoData);
    return response.data;
  },

  // Get all photos with optional filtering
  getPhotos: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.description) {
      params.append('description', filters.description);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    if (filters.offset) {
      params.append('offset', filters.offset);
    }

    const response = await api.get(`/photos?${params.toString()}`);
    return response.data;
  },

  // Get single photo
  getPhoto: async (photoId) => {
    const response = await api.get(`/photos/${photoId}`);
    return response.data;
  },

  // Delete photo
  deletePhoto: async (photoId) => {
    const response = await api.delete(`/photos/${photoId}`);
    return response.data;
  },

  // Get photos count
  getPhotosCount: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.description) {
      params.append('description', filters.description);
    }

    const response = await api.get(`/photos/count?${params.toString()}`);
    return response.data;
  },
};

export default api;