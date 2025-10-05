import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import MapComponent from './components/MapComponent';
import UploadForm from './components/UploadForm';
import FilterComponent from './components/FilterComponent';
import PhotoModal from './components/PhotoModal';
import Header from './components/Header';
import { photoAPI } from './services/api';
import './styles/App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

  // Fetch photos from API
  const fetchPhotos = useCallback(async (searchFilter = '') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = {};
      if (searchFilter.trim()) {
        filters.description = searchFilter.trim();
      }
      
      const photosData = await photoAPI.getPhotos(filters);
      setPhotos(photosData);
      setFilteredPhotos(photosData);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Handle filter changes
  useEffect(() => {
    if (!filter.trim()) {
      setFilteredPhotos(photos);
    } else {
      const filtered = photos.filter(photo =>
        photo.description.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredPhotos(filtered);
    }
  }, [filter, photos]);

  // Handle successful upload
  const handleUploadSuccess = useCallback((newPhoto) => {
    setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
    // Refresh photos to get latest data
    fetchPhotos(filter);
  }, [fetchPhotos, filter]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback((photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  }, []);

  return (
    <div className="app">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Header />
      
      <main className="main-content">
        <div className="sidebar">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
          <FilterComponent 
            onFilterChange={handleFilterChange}
            currentFilter={filter}
            photosCount={filteredPhotos.length}
            totalPhotos={photos.length}
          />
        </div>
        
        <div className="map-container">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => fetchPhotos(filter)}>Retry</button>
            </div>
          )}
          
          <MapComponent
            photos={filteredPhotos}
            onMarkerClick={handleMarkerClick}
            isLoading={isLoading}
          />
        </div>
      </main>

      <PhotoModal
        photo={selectedPhoto}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default App;