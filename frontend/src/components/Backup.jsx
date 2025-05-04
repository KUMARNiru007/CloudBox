import React, { useState } from 'react';
import './FileExplorer.css';
import FileItem from './FileItem';

const Backup = ({ darkMode, backup, setRecycleBin, setFiles }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter files based on search query
  const filteredFiles = backup.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  // Restore a file from recycle bin
  const handleRestoreFile = (fileId) => {
    const fileToRestore = backup.find(file => file.id === fileId);
    if (fileToRestore) {
      // Add file back to files array
      setFiles(prevFiles => [...prevFiles, fileToRestore]);
      // Remove file from recycle bin
      setRecycleBin(prevRecycleBin => prevRecycleBin.filter(file => file.id !== fileId));
    }
  };
  
  // Permanently delete a file
  const handlePermanentDelete = (fileId) => {
    setRecycleBin(prevRecycleBin => prevRecycleBin.filter(file => file.id !== fileId));
  };
  
  // Empty the recycle bin
  const handleEmptyRecycleBin = () => {
    setRecycleBin([]);
  };
  
  return (
    <div className="file-explorer">
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search deleted files..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="files-section">
        <div className="all-files-header">
          <h2>Recycle Bin</h2>
          <div className="files-header-actions">
            {backup.length > 0 && (
              <div className="file-count">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} 
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            )}
            {backup.length > 0 && (
              <button 
                className="empty-bin-button"
                onClick={handleEmptyRecycleBin}
              >
                Empty Recycle Bin
              </button>
            )}
          </div>
        </div>
        
        <div className="files-list">
          {filteredFiles.map(file => (
            <FileItem 
              key={file.id} 
              file={{
                ...file,
                size: file.displaySize || formatFileSize(file.size)
              }}
              darkMode={darkMode}
              isInRecycleBin={true}
              onDelete={() => handlePermanentDelete(file.id)}
              onRestore={() => handleRestoreFile(file.id)}
            />
          ))}
          
          {backup.length === 0 && (
            <div className="no-files">
              <p>Recycle bin is empty</p>
            </div>
          )}
          
          {backup.length > 0 && filteredFiles.length === 0 && (
            <div className="no-files">
              <p>No files match your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Backup;