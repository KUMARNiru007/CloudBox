import { useState, useRef, useEffect } from 'react';
import './FileExplorer.css';
import FileItem from './FileItem';
import { fileService } from '../services/api';  // Add this import

const FileExplorer = ({ darkMode, files, setFiles, backup, setRecycleBin }) => {
  const [folders, setFolders] = useState([
    { name: 'Documents', size: null, extensions: ['.pdf', '.doc', '.docx', '.txt'] },
    { name: 'Music', size: null, extensions: ['.mp3', '.wav', '.ogg', '.m4a'] },
    { name: 'Video', size: null, extensions: ['.mp4', '.avi', '.mkv', '.mov'] },
    { name: 'Images', size: null, extensions: ['.jpg', '.png', '.gif', '.jpeg'] },
    { name: 'Programs', size: null, extensions: ['.exe', '.msi', '.app', '.dmg'] }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Get file extension
  const getFileExtension = (filename) => {
    if (!filename) return '';
    const ext = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    return `.${ext.toLowerCase()}`;
  };

  // Determine which folder a file belongs to
  const getFolderForFile = (filename) => {
    const extension = `.${getFileExtension(filename)}`;
    return folders.find(folder => folder.extensions.includes(extension));
  };

  // Update folder sizes based on current files
  const updateFolderSizes = (files) => {
    const folderSizes = folders.map(folder => ({
      ...folder,
      size: files
        .filter(file => file && file.name)
        .filter(file => {
          const extension = getFileExtension(file.name);
          return folder.extensions.includes(extension);
        })
        .reduce((total, file) => total + (file.size || 0), 0)
    }));
    setFolders(folderSizes);
  };

  // Automatically update folder sizes when files change
  useEffect(() => {
    updateFolderSizes(files);
  }, [files]);

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file && file.name && file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Upload a file to the system
  const uploadFile = async (file) => {
    setIsLoading(true);
    
    try {
      const response = await fileService.uploadFile(file);
      
      // Update files with the new data from the server
      if (response && response.data) {
        setFiles(response.data.map(file => ({
          id: file._id,
          name: file.originalName,
          type: file.mimeType,
          size: file.size,
          uploadDate: new Date(file.createdAt).toLocaleDateString()
        })));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate files before upload
    selectedFiles.forEach(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      // You can add more validations here (file type, etc.)
      
      uploadFile(file);
    });
    
    e.target.value = '';
  };
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  // Move a file to recycle bin instead of deleting it
  const handleMoveToRecycleBin = async (fileId) => {
    const fileToRecycle = files.find(file => file.id === fileId);
    if (fileToRecycle) {
      try {
        // Call the API to delete the file
        await fileService.deleteFile(fileId);
        
        // Add file to recycle bin (frontend only)
        setRecycleBin(prevRecycleBin => [...prevRecycleBin, fileToRecycle]);
        
        // Remove file from files array
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      } catch (error) {
        console.error("Error deleting file:", error);
        // You could add error handling UI here
      }
    }
  };
  
  // Download a file
  const handleDownloadFile = async (file) => {
    try {
      await fileService.downloadFile(file.id, file.name);
    } catch (error) {
      console.error("Error downloading file:", error);
      // You could add error handling UI here
    }
  };
  
  // Navigate to a folder
  const handleFolderClick = (folderName) => {
    console.log(`Navigating to folder: ${folderName}`);
  };
  
  return (
    <div className="file-explorer">
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search files..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="files-section">
        <h2>My Files</h2>
        
        <div className="folders-grid">
          {folders.map((folder, index) => (
            <div 
              className="folder-card" 
              key={index}
              onClick={() => handleFolderClick(folder.name)} 
            >
              <div className="folder-icon">📁</div>
              <div className="folder-info">
                <div className="folder-name">{folder.name}</div>
                <div className="folder-size">{formatFileSize(folder.size)}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="all-files-header">
          <h2>All Files</h2>
          <div className="files-header-actions">
            {files.length > 0 && (
              <div className="file-count">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} 
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            )}
            <button 
              className="upload-button"
              onClick={handleUploadClick}
            >
              Upload 
            </button>
          </div>
        </div>
        
        <div className="files-list">
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Uploading files...</p>
            </div>
          )}
          
          {!isLoading && filteredFiles.map(file => (
            <FileItem 
              key={file.id} 
              file={{
                ...file,
                size: file.displaySize || formatFileSize(file.size)
              }}
              darkMode={darkMode}
              onDelete={() => handleMoveToRecycleBin(file.id)}
              onDownload={() => handleDownloadFile(file)}
            />
          ))}
          
          {!isLoading && files.length === 0 && (
            <div className="no-files">
              <p>No files uploaded yet</p>
            </div>
          )}
          
          {!isLoading && files.length > 0 && filteredFiles.length === 0 && (
            <div className="no-files">
              <p>No files match your search</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="upload-section">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          multiple
        />
      </div>
    </div>
  );
};

export default FileExplorer;