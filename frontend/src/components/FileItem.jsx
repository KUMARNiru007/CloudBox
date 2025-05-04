import React, { useState, useRef, useEffect } from 'react';
import './FileItem.css';

const FileItem = ({ file, onDelete, onDownload, onRestore, isInRecycleBin = false }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const downloadButtonRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cleanup any pending timeouts
  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const getFileIcon = (type) => {
    const iconMap = {
      video: '🎬',
      audio: '🎵',
      image: '🖼️',
      pdf: '📄',
      document: '📝',
      word: '📝',
      spreadsheet: '📊',
      excel: '📊',
      presentation: '📽️',
      powerpoint: '📽️'
    };
    
    return Object.entries(iconMap).find(([key]) => 
      type.includes(key)
    )?.[1] || '📄';
  };

  const handleDownload = () => {
    onDownload(file);
    if (downloadButtonRef.current) {
      downloadButtonRef.current.classList.add('downloading');
      timeoutRef.current = setTimeout(() => {
        downloadButtonRef.current?.classList.remove('downloading');
      }, 1000);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(file.id);
    setShowConfirmation(false);
  };

  const handleConfirmRestore = () => {
    onRestore(file.id);
    setShowConfirmation(false);
  };

  return (
    <div className="file-item">
      <div className="file-icon">{getFileIcon(file.type)}</div>
      
      <div className="file-details">
        <div className="file-name">{file.name}</div>
        <div className="file-meta">
          <span className="file-size">{file.size}</span>
          {file.uploadDate && <span className="file-date">• {file.uploadDate}</span>}
        </div>
      </div>
      
      {showConfirmation ? (
        <div className="delete-confirmation">
          <span>{isInRecycleBin ? "Permanently delete file?" : "Move to recycle bin?"}</span>
          <div className="confirmation-buttons">
            <button 
              className="confirm-btn" 
              onClick={isInRecycleBin ? handleConfirmDelete : handleConfirmDelete}
            >
              Yes
            </button>
            <button 
              className="cancel-btn" 
              onClick={() => setShowConfirmation(false)}
            >
              No
            </button>
          </div>
        </div>
      ) : (
        <div className="file-actions">
          {!isInRecycleBin && (
            <button 
              ref={downloadButtonRef}
              className="file-action download-btn" 
              onClick={handleDownload}
              aria-label="Download file"
              title="Download"
            >
              ⬇️
            </button>
          )}
          
          {isInRecycleBin ? (
            <>
              <button 
                className="file-action restore-btn" 
                onClick={handleConfirmRestore}
                aria-label="Restore file"
                title="Restore"
              >
                ♻️
              </button>
              <button 
                className="file-action delete-btn" 
                onClick={() => setShowConfirmation(true)}
                aria-label="Permanently delete file"
                title="Delete permanently"
              >
                ❌
              </button>
            </>
          ) : (
            <button 
              className="file-action delete-btn" 
              onClick={() => setShowConfirmation(true)}
              aria-label="Delete file"
              title="Delete"
            >
              ❌
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileItem;