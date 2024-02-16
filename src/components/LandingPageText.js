// components/LandingPageText.js

import React from 'react';
import SpotifyButton from './SpotifyButton';

const LandingPageText = () => {
  return (
    <div className="text-container">
      <h1 className="title">The Shiz</h1>
      <p className="description">
      Visualize your favorite artists, and how they connect!
      </p>
      <SpotifyButton />
    </div>
  );
};

export default LandingPageText;
