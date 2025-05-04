import { useState, useRef, useEffect } from 'react';
import './FileExplorer.css';
import FileItem from './FileItem';

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
        .filter(file => {
          const extension = getFileExtension(file.name);
          return folder.extensions.includes(extension);
        })
        .reduce((total, file) => total + file.size, 0)
    }));
    setFolders(folderSizes);
  };

  // Automatically update folder sizes when files change
  useEffect(() => {
    updateFolderSizes(files);
  }, [files]);

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Upload a file to the system
  const uploadFile = (file) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size, // Store the raw size in bytes
        displaySize: formatFileSize(file.size), // Add a separate property for display
        file: file,
        uploadDate: new Date().toLocaleDateString()
      };
      
      setFiles(prevFiles => [...prevFiles, newFile]);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach(file => uploadFile(file));
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
  const handleMoveToRecycleBin = (fileId) => {
    const fileToRecycle = files.find(file => file.id === fileId);
    if (fileToRecycle) {
      // Add file to recycle bin
      setRecycleBin(prevRecycleBin => [...prevRecycleBin, fileToRecycle]);
      // Remove file from files array
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    }
  };
  
  // Download a file
  const handleDownloadFile = (file) => {
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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