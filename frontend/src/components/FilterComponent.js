import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import '../styles/FilterComponent.css';

const FilterComponent = ({ 
  onFilterChange, 
  currentFilter, 
  photosCount, 
  totalPhotos 
}) => {
  const [searchTerm, setSearchTerm] = useState(currentFilter || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce search input
  const debounceTimeout = React.useRef(null);

  const debouncedFilterChange = useCallback((value) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      onFilterChange(value);
    }, 300); // 300ms delay
  }, [onFilterChange]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFilterChange(value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    onFilterChange('');
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onFilterChange(searchTerm);
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Sync with external filter changes
  useEffect(() => {
    if (currentFilter !== searchTerm) {
      setSearchTerm(currentFilter || '');
    }
  }, [currentFilter, searchTerm]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Common search suggestions
  const searchSuggestions = [
    'plastic bottles',
    'garbage bags',
    'food waste',
    'cigarette butts',
    'paper litter',
    'broken glass',
    'metal cans',
    'construction debris'
  ];

  const isFiltered = searchTerm.trim().length > 0;
  const showingFiltered = isFiltered && photosCount !== totalPhotos;

  return (
    <div className="filter-component">
      <div className="filter-header">
        <h3>
          <Filter size={18} />
          Search & Filter
        </h3>
        <button
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
        {/* Search Input */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyPress}
              className="search-input"
              aria-label="Search photos by description"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="clear-btn"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          {showingFiltered ? (
            <p className="filtered-results">
              Showing <strong>{photosCount}</strong> of <strong>{totalPhotos}</strong> photos
              {searchTerm && (
                <span className="filter-term">
                  matching "<em>{searchTerm}</em>"
                </span>
              )}
            </p>
          ) : (
            <p className="total-results">
              <strong>{totalPhotos}</strong> photo{totalPhotos !== 1 ? 's' : ''} total
            </p>
          )}
        </div>

        {/* Search Suggestions */}
        {isExpanded && !isFiltered && (
          <div className="search-suggestions">
            <h4>Quick Searches:</h4>
            <div className="suggestion-tags">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-tag"
                  onClick={() => {
                    setSearchTerm(suggestion);
                    onFilterChange(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filter Display */}
        {isFiltered && (
          <div className="active-filters">
            <h4>Active Filter:</h4>
            <div className="filter-tag">
              <span>"{searchTerm}"</span>
              <button onClick={clearSearch} aria-label="Remove filter">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {isFiltered && photosCount === 0 && (
          <div className="no-results">
            <p>No photos found matching your search.</p>
            <button onClick={clearSearch} className="clear-filter-btn">
              Clear filter to see all photos
            </button>
          </div>
        )}

        {/* Search Tips */}
        {isExpanded && (
          <div className="search-tips">
            <h4>Search Tips:</h4>
            <ul>
              <li>Search is case-insensitive</li>
              <li>Use keywords like "plastic", "garbage", "litter"</li>
              <li>Press Enter to search immediately</li>
              <li>Press Escape to clear the search</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterComponent;