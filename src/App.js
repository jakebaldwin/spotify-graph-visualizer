// App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import LandingPageText from './components/LandingPageText';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Function to check if the user is logged in
    const checkLoggedInStatus = async () => {
      try {
        // Make a request to the backend to check if the user is logged in
        const response = await fetch('/api/loggedin');
        const data = await response.json();

        // Set the isLoggedIn state based on the response
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    // Call the function to check login status when the component mounts
    checkLoggedInStatus();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  const onLogout = async () => {
    try {
      // Make a request to the backend to check if the user is logged in
      const response = await fetch('/api/logout');
      const data = await response.json();

      // Set the isLoggedIn state based on the response
      setIsLoggedIn(data.isLoggedIn);
    } catch (error) {
      console.error('Error logging you out:', error);
    }
  }

  return (
    <div className="container">
      {isLoggedIn ? (
        <HomePage onLogout={onLogout}/>
      ) : (
        // User is not logged in, display landing page
        <LandingPageText />
      )}
    </div>
  );
};

export default App;
