import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import FileExplorer from './components/FileExplorer';
import Backup from './components/Backup';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  // Use localStorage to persist dark mode preference
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth ? JSON.parse(savedAuth) : false;
  });
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  
  // State for active view (files or recycle bin)
  const [activeView, setActiveView] = useState('files');
  
  // State for files and recycled files
  const [files, setFiles] = useState([]);
  const [backup, setRecycleBin] = useState([]);
  
  // Update localStorage when darkMode changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Apply dark mode class to the document body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  // Update localStorage when authentication state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    localStorage.setItem('user', JSON.stringify(user));
  }, [isAuthenticated, user]);
  
  // Add this useEffect to load files when the component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is logged in
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData.data);
          setIsAuthenticated(true);
          
          // Load user files
          const filesData = await fileService.getUserFiles();
          setFiles(filesData.data || []);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Add this useEffect
  useEffect(() => {
    const loadFiles = async () => {
      if (isAuthenticated) {
        try {
          const filesData = await fileService.syncFiles();
          setFiles(filesData);
        } catch (error) {
          console.error("Error loading files:", error);
        }
      }
    };
    loadFiles();
  }, [isAuthenticated]);

  const handleLogin = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Load files immediately after login
    const filesData = await fileService.syncFiles();
    setFiles(filesData);
  };
  
  const handleRegister = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setFiles([]);
    setRecycleBin([]);
    // Remove localStorage.removeItem('authToken');
  };
  
  // If not authenticated, show login/register screens
  if (!isAuthenticated) {
    return (
      <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        {authView === 'login' ? (
          <Login 
            onLogin={handleLogin} 
            switchToRegister={() => setAuthView('register')} 
          />
        ) : (
          <Register 
            onRegister={handleRegister} 
            switchToLogin={() => setAuthView('login')} 
          />
        )}
      </div>
    );
  }
  
  // If authenticated, show the main app
  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={handleLogout}
      />
      {activeView === 'files' ? (
        <FileExplorer 
          darkMode={darkMode} 
          files={files}
          setFiles={setFiles}
          backup={backup}
          setRecycleBin={setRecycleBin}
        />
      ) : (
        <Backup 
          darkMode={darkMode} 
          backup={backup}
          setRecycleBin={setRecycleBin}
          files={files}
          setFiles={setFiles}
        />
      )}
    </div>
  );
}

export default App;
