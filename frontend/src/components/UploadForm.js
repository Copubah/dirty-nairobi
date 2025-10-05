import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, MapPin, FileText, Loader2, Search, X } from 'lucide-react';
import { photoAPI } from '../services/api';
import '../styles/UploadForm.css';

const UploadForm = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    image: null,
    description: '',
    latitude: '',
    longitude: '',
    locationName: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Nairobi bounds for validation
  const NAIROBI_BOUNDS = {
    lat: { min: -1.5, max: -1.0 },
    lng: { min: 36.5, max: 37.2 }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      image: file
    }));

    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Search for locations using Nominatim API
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingLocation(true);
    
    try {
      // Use Nominatim API to search for locations in Nairobi
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query + ', Nairobi, Kenya')}&` +
        `format=json&` +
        `limit=5&` +
        `countrycodes=ke&` +
        `bounded=1&` +
        `viewbox=36.5,-1.5,37.2,-1.0&` +
        `addressdetails=1`
      );
      
      const data = await response.json();
      
      const suggestions = data
        .filter(item => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          return lat >= NAIROBI_BOUNDS.lat.min && 
                 lat <= NAIROBI_BOUNDS.lat.max &&
                 lon >= NAIROBI_BOUNDS.lng.min && 
                 lon <= NAIROBI_BOUNDS.lng.max;
        })
        .map(item => ({
          id: item.place_id,
          name: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          address: item.address
        }));
      
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
      toast.error('Failed to search locations');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Handle location input change with debouncing
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      locationName: value,
      latitude: '',
      longitude: ''
    }));

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);

    // Clear errors
    if (errors.latitude || errors.longitude) {
      setErrors(prev => ({
        ...prev,
        latitude: '',
        longitude: ''
      }));
    }
  };

  // Handle location suggestion selection
  const handleLocationSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      locationName: suggestion.name,
      latitude: suggestion.latitude.toFixed(6),
      longitude: suggestion.longitude.toFixed(6)
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
    toast.success('Location selected!');
  };

  // Clear location search
  const clearLocationSearch = () => {
    setFormData(prev => ({
      ...prev,
      locationName: '',
      latitude: '',
      longitude: ''
    }));
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    toast.loading('Getting your location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Validate coordinates are within Nairobi bounds
        if (
          latitude >= NAIROBI_BOUNDS.lat.min && 
          latitude <= NAIROBI_BOUNDS.lat.max &&
          longitude >= NAIROBI_BOUNDS.lng.min && 
          longitude <= NAIROBI_BOUNDS.lng.max
        ) {
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            locationName: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          }));
          toast.dismiss();
          toast.success('Location detected!');
        } else {
          toast.dismiss();
          toast.error('Location is outside Nairobi area');
        }
      },
      (error) => {
        toast.dismiss();
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.image) {
      newErrors.image = 'Please select an image';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (!formData.latitude || isNaN(lat)) {
      newErrors.latitude = 'Please provide a valid latitude';
    } else if (lat < NAIROBI_BOUNDS.lat.min || lat > NAIROBI_BOUNDS.lat.max) {
      newErrors.latitude = 'Latitude must be within Nairobi bounds (-1.5 to -1.0)';
    }

    if (!formData.longitude || isNaN(lng)) {
      newErrors.longitude = 'Please provide a valid longitude';
    } else if (lng < NAIROBI_BOUNDS.lng.min || lng > NAIROBI_BOUNDS.lng.max) {
      newErrors.longitude = 'Longitude must be within Nairobi bounds (36.5 to 37.2)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsUploading(true);
    
    try {
      // Step 1: Get pre-signed URL
      toast.loading('Preparing upload...');
      const presignedData = await photoAPI.getPresignedUrl(
        formData.image.name,
        formData.image.type
      );

      // Step 2: Upload to S3
      toast.dismiss();
      toast.loading('Uploading image...');
      await photoAPI.uploadToS3(presignedData.upload_url, formData.image);

      // Step 3: Save metadata
      toast.dismiss();
      toast.loading('Saving photo details...');
      const photoData = {
        s3_key: presignedData.s3_key,
        description: formData.description.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      const newPhoto = await photoAPI.createPhoto(photoData);

      // Success!
      toast.dismiss();
      toast.success('Photo uploaded successfully!');
      
      // Reset form
      setFormData({
        image: null,
        description: '',
        latitude: '',
        longitude: '',
        locationName: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('image-input');
      if (fileInput) fileInput.value = '';

      // Notify parent component
      onUploadSuccess(newPhoto);

    } catch (error) {
      toast.dismiss();
      console.error('Upload error:', error);
      
      if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else {
        toast.error('Failed to upload photo. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-form">
      <h2>Report a Dirty Spot</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="form-group">
          <label htmlFor="image-input">Photo *</label>
          <div 
            className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${errors.image ? 'error' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            
            {formData.image ? (
              <div className="file-preview">
                <img 
                  src={URL.createObjectURL(formData.image)} 
                  alt="Preview" 
                  className="preview-image"
                />
                <p>{formData.image.name}</p>
              </div>
            ) : (
              <div className="drop-zone-content">
                <Upload size={32} />
                <p>Drop an image here or click to select</p>
                <small>JPEG, PNG, GIF, WebP (max 10MB)</small>
              </div>
            )}
          </div>
          {errors.image && <span className="error-text">{errors.image}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">
            <FileText size={16} />
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what you see (e.g., 'Plastic bottles scattered near the bus stop')"
            rows={3}
            disabled={isUploading}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        {/* Location */}
        <div className="form-group">
          <label>
            <MapPin size={16} />
            Location *
          </label>
          
          {/* Location Search Input */}
          <div className="location-search-container" ref={suggestionsRef}>
            <div className="location-search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search for a location in Nairobi (e.g., 'Westlands', 'CBD', 'Karen')"
                value={formData.locationName}
                onChange={handleLocationInputChange}
                disabled={isUploading}
                className={`location-search-input ${(errors.latitude || errors.longitude) ? 'error' : ''}`}
              />
              {formData.locationName && (
                <button
                  type="button"
                  onClick={clearLocationSearch}
                  className="clear-location-btn"
                  disabled={isUploading}
                >
                  <X size={16} />
                </button>
              )}
              {isSearchingLocation && (
                <Loader2 size={16} className="search-loading spinner" />
              )}
            </div>
            
            {/* Location Suggestions */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="location-suggestions">
                {locationSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="location-suggestion"
                    onClick={() => handleLocationSelect(suggestion)}
                  >
                    <MapPin size={14} />
                    <div className="suggestion-content">
                      <div className="suggestion-name">
                        {suggestion.address?.suburb || suggestion.address?.neighbourhood || 
                         suggestion.address?.road || 'Unknown Area'}
                      </div>
                      <div className="suggestion-address">
                        {suggestion.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Current Location Button */}
          <button
            type="button"
            onClick={getCurrentLocation}
            className="location-btn"
            disabled={isUploading}
          >
            <MapPin size={16} />
            Use Current Location
          </button>

          {/* Coordinates Display (Read-only) */}
          {(formData.latitude && formData.longitude) && (
            <div className="coordinates-display">
              <div className="coordinate-info">
                <span className="coordinate-label">Coordinates:</span>
                <span className="coordinate-value">
                  {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                </span>
              </div>
            </div>
          )}
          
          {(errors.latitude || errors.longitude) && (
            <span className="error-text">
              {errors.latitude || errors.longitude}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-btn"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="spinner" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload Photo
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;