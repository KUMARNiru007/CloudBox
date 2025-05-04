import React from 'react';
import './Sidebar.css';

const Sidebar = ({ darkMode, setDarkMode, activeView, setActiveView, user, onLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">CloudBox</h1>
      </div>
      
      {user && (
        <div className="user-info">
          <div className="user-avatar">
            {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{user.username || user.email}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      )}
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeView === 'files' ? 'active' : ''}`}
          onClick={() => setActiveView('files')}
        >
          <span className="nav-icon">📁</span>
          <span className="nav-text">My Files</span>
        </button>
        
        <button 
          className={`nav-item ${activeView === 'recycle-bin' ? 'active' : ''}`}
          onClick={() => setActiveView('recycle-bin')}
        >
          <span className="nav-icon">🗑️</span>
          <span className="nav-text">Recycle Bin</span>
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="theme-icon">{darkMode ? '☀️' : '🌙'}</span>
          <span className="theme-text">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        
        {user && (
          <button 
            className="logout-button"
            onClick={onLogout}
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;