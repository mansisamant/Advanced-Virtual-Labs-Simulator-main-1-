import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add explicit isLoggedIn state

  useEffect(() => {
    // Check localStorage for existing user data
    const storedUser = localStorage.getItem('user');
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    
    if (storedUser && storedLoginStatus) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true); // Explicitly set logged in state
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Login function to update both user data and isLoggedIn status
  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', true);
  };

  // Improved logout function 
  const logout = () => {
    // Clear user data
    setUser(null);
    setIsLoggedIn(false);
    
    // Remove from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    console.log("User logged out successfully");
  };

  // Add function to update user context
  const updateUserContext = (updatedUserData) => {
    setUser(prevUser => {
      const newUserData = {
        ...prevUser,
        ...updatedUserData
      };
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(newUserData));
      return newUserData;
    });
  };
  
  // Helper function to check admin status
  const isAdmin = user && user.role === 'admin';

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      isLoggedIn, 
      setIsLoggedIn, 
      login, 
      logout, 
      isAdmin, 
      isLoading, 
      updateUserContext 
    }}>
      {children}
    </UserContext.Provider>
  );
};