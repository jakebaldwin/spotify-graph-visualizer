// components/LandingPageText.js

import React from 'react';
import SpotifyButton from './SpotifyButton';

const LandingPageText = () => {
  return (
    <div className="text-container">
      <h1 className="title">Spotify Pen Pals</h1>
      <p className="description">
      Connecting music lovers worldwide in a symphony of shared tunes. To get started, login with
      </p>
      <SpotifyButton />
    </div>
  );
};

export default LandingPageText;
