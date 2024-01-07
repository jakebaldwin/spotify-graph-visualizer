import React from 'react';
import '../css/SpotifyButton.css';

const SpotifyButton = () => {
  return (
    <div className="spotify-button-container">
      <a href="/api/login" className="spotify-button">
        LOG IN WITH SPOTIFY
      </a>
    </div>
  );
};

export default SpotifyButton;
