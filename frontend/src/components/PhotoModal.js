import React, { useEffect } from 'react';
import { X, MapPin, Calendar, ExternalLink } from 'lucide-react';
import '../styles/PhotoModal.css';

const PhotoModal = ({ photo, isOpen, onClose }) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !photo) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${photo.latitude},${photo.longitude}`;
    window.open(url, '_blank');
  };

  const copyCoordinates = async () => {
    const coords = `${photo.latitude}, ${photo.longitude}`;
    try {
      await navigator.clipboard.writeText(coords);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy coordinates:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2>Photo Details</h2>
          <button 
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Image */}
          <div className="image-container">
            <img 
              src={photo.s3_url} 
              alt={photo.description}
              className="modal-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="image-error" style={{ display: 'none' }}>
              <p>Failed to load image</p>
            </div>
          </div>

          {/* Details */}
          <div className="photo-details">
            {/* Description */}
            <div className="detail-section">
              <h3>Description</h3>
              <p className="description-text">{photo.description}</p>
            </div>

            {/* Location */}
            <div className="detail-section">
              <h3>
                <MapPin size={18} />
                Location
              </h3>
              <div className="location-info">
                <div className="coordinates">
                  <span className="coord-label">Latitude:</span>
                  <span className="coord-value">{photo.latitude.toFixed(6)}</span>
                </div>
                <div className="coordinates">
                  <span className="coord-label">Longitude:</span>
                  <span className="coord-value">{photo.longitude.toFixed(6)}</span>
                </div>
                <div className="location-actions">
                  <button 
                    className="location-btn"
                    onClick={copyCoordinates}
                    title="Copy coordinates to clipboard"
                  >
                    Copy Coordinates
                  </button>
                  <button 
                    className="location-btn primary"
                    onClick={openInGoogleMaps}
                    title="Open in Google Maps"
                  >
                    <ExternalLink size={16} />
                    View on Map
                  </button>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="detail-section">
              <h3>
                <Calendar size={18} />
                Reported
              </h3>
              <p className="timestamp">{formatDate(photo.created_at)}</p>
            </div>

            {/* Photo ID (for debugging/support) */}
            <div className="detail-section">
              <h3>Photo ID</h3>
              <p className="photo-id">{photo.id}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;