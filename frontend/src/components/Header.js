import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">
            <Camera size={32} />
            <MapPin size={24} className="map-icon" />
          </div>
          <div className="title-section">
            <h1>HaiWork</h1>
            <p className="subtitle">Report and visualize environmental issues in Nairobi</p>
          </div>
        </div>
        
        <nav className="nav-section">
          <a 
            href="https://github.com/Copubah/dirty-nairobi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;