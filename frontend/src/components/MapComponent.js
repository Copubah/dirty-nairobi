import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Loader2 } from 'lucide-react';
import '../styles/MapComponent.css';

// Fix for default markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Nairobi coordinates - moved outside component to avoid dependency issues
const NAIROBI_CENTER = [-1.2921, 36.8219];
const NAIROBI_BOUNDS = [
  [-1.5, 36.5], // Southwest
  [-1.0, 37.2]  // Northeast
];

const MapComponent = ({ photos, onMarkerClick, isLoading }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: NAIROBI_CENTER,
      zoom: 12,
      maxBounds: NAIROBI_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 10,
      maxZoom: 18,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let className = 'marker-cluster-small';
        
        if (count > 10) {
          className = 'marker-cluster-medium';
        }
        if (count > 50) {
          className = 'marker-cluster-large';
        }

        return new L.DivIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: new L.Point(40, 40)
        });
      }
    });

    map.addLayer(markers);

    // Store references
    mapInstanceRef.current = map;
    markersRef.current = markers;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  // Update markers when photos change
  useEffect(() => {
    if (!markersRef.current || !photos) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers
    photos.forEach(photo => {
      const marker = L.marker([photo.latitude, photo.longitude]);
      
      // Create popup content
      const popupContent = `
        <div class="photo-popup">
          <img 
            src="${photo.s3_url}" 
            alt="${photo.description}"
            class="popup-image"
            onerror="this.style.display='none'"
          />
          <div class="popup-content">
            <p class="popup-description">${photo.description}</p>
            <div class="popup-meta">
              <small class="popup-date">
                ${new Date(photo.created_at).toLocaleDateString()}
              </small>
              <small class="popup-coords">
                ${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}
              </small>
            </div>
            <button 
              class="popup-view-btn" 
              onclick="window.handlePhotoClick('${photo.id}')"
            >
              View Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Add click handler
      marker.on('click', () => {
        onMarkerClick(photo);
      });

      markersRef.current.addLayer(marker);
    });

    // Fit bounds to show all markers if there are any
    if (photos.length > 0 && markersRef.current.getLayers().length > 0) {
      const group = new L.featureGroup(markersRef.current.getLayers());
      const bounds = group.getBounds();
      
      // Only fit bounds if there are multiple photos or if single photo is outside current view
      if (photos.length > 1) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      } else if (photos.length === 1) {
        const currentBounds = mapInstanceRef.current.getBounds();
        if (!currentBounds.contains([photos[0].latitude, photos[0].longitude])) {
          mapInstanceRef.current.setView([photos[0].latitude, photos[0].longitude], 15);
        }
      }
    }
  }, [photos, onMarkerClick]);

  // Global function for popup button clicks
  useEffect(() => {
    window.handlePhotoClick = (photoId) => {
      const photo = photos.find(p => p.id === photoId);
      if (photo) {
        onMarkerClick(photo);
      }
    };

    return () => {
      delete window.handlePhotoClick;
    };
  }, [photos, onMarkerClick]);

  return (
    <div className="map-component">
      {isLoading && (
        <div className="map-loading">
          <Loader2 size={32} className="spinner" />
          <p>Loading photos...</p>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="map-container"
        style={{ height: '100%', width: '100%' }}
      />
      
      {!isLoading && photos.length === 0 && (
        <div className="map-empty">
          <p>No photos to display</p>
          <small>Upload the first photo to get started!</small>
        </div>
      )}
      
      {!isLoading && photos.length > 0 && (
        <div className="map-stats">
          <span className="photo-count">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} displayed
          </span>
        </div>
      )}
    </div>
  );
};

export default MapComponent;