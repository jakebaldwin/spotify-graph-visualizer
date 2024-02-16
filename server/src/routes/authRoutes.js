const express = require('express');
const axios = require('axios');
require('dotenv').config()

const router = express.Router();

const client_id = process.env.CLIENT_ID || "";
const client_secret = process.env.CLIENT_SECRET || "";
redirect_uri = "http://localhost:3000/api/callback"

let accessToken = null;
let refreshToken = null;
router.get('/login', (req, res) => {
  // Construct Spotify authorization URL
  
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=user-read-private%20user-read-email%20user-top-read&response_type=code`;
  res.redirect(spotifyAuthUrl);
});

router.get('/loggedin', (req, res) => {

  // Check for the presence of an access token in the request headers, query parameters, or cookies
  if (accessToken) {
    // If an access token is present, the user is considered logged in
    // You might also validate the token here if needed
    res.json({ isLoggedIn: true, message: 'User is logged in' });
  } else {
    // If no access token is present, the user is not logged in
    res.json({ isLoggedIn: false, message: 'User not logged in' });
  }
});

router.get('/logout', (req, res) => {
  // Set the access token to null
  accessToken = null;

  // Respond with isLoggedIn: false in JSON
  res.json({ isLoggedIn: false, message: 'User logged out successfully' });
});


router.get('/callback', async (req, res) => {
  try {
    // Extract authorization code from the query parameters
    const authorizationCode = req.query.code;

    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${redirect_uri}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
          },
        }
      );

    // Handle the response and store tokens securely
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;

    // Redirect the user to your frontend or wherever appropriate
    res.redirect('http://localhost:3000');
  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/recommendedArtists', async (req, res) => {
  try {
    const topArtistsLimit = 25; // Top 10 artists
    const recommendedArtistsLimit = 50; // Limit of recommended artists per top artist
    const randomLimit = Math.floor(Math.random() * 3);
    const randomTerm = ['short_term', 'medium_term', 'long_term'][randomLimit];
    // Fetch user's top artists from Spotify API
    const spotifyResponse = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=${topArtistsLimit}&?time_range=${randomTerm}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Add other headers as needed
      },
      // Add other fetch options like method, body, etc.
    });

    const topArtistsData = await spotifyResponse.json();

    // Extract artist IDs, names, and image URLs from user's top artists
    const topArtists = topArtistsData.items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      imageUrl: artist.images.length > 0 ? artist.images[0].url : null, // Get the first image URL if available
      spotifyLink: artist.external_urls.spotify // Spotify link
    }));

    // Initialize an array to store nodes and edges
    let nodes = [];
    let edges = [];

    // Add top artists to the nodes array
    topArtists.forEach(artist => {
      nodes.push({
        id: artist.id,
        label: artist.name,
        title: artist.spotifyLink,
        isTopArtist: true,
        image: 'http://localhost:3000/api/proxy/' + artist.imageUrl.replace('https://i.scdn.co/image', '')
      });
    });

    // Fetch recommended artists for each top artist and add them to the nodes array
    for (const topArtist of topArtists) {
      const recommendedArtistsResponse = await fetch(`https://api.spotify.com/v1/artists/${topArtist.id}/related-artists?limit=${recommendedArtistsLimit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Add other headers as needed
        },
        // Add other fetch options like method, body, etc.
      });

      const recommendedArtistsData = await recommendedArtistsResponse.json();

      // Extract recommended artists IDs, names, and image URLs
      const relatedArtists = recommendedArtistsData.artists.map((artist) => ({
        id: artist.id,
        label: artist.name,
        title: artist.external_urls.spotify,
        isTopArtist: false,
        image: artist.images.length > 0 ? 'http://localhost:3000/api/proxy/' + artist.images[0].url.replace('https://i.scdn.co/image/', '') : null // Get the first image URL if available
      }));

      // Add recommended artists to the nodes array, if not already present
      relatedArtists.forEach(recommendedArtist => {
        if (!nodes.some(node => node.id === recommendedArtist.id)) {
          nodes.push(recommendedArtist);
        }

        edges.push({ id: topArtist.id + ' ' + recommendedArtist.id, from: topArtist.id, to: recommendedArtist.id });
      });
    }

    // Count the number of incoming edges for each node
    const incomingEdgeCounts = {};
    edges.forEach(edge => {
      incomingEdgeCounts[edge.to] = incomingEdgeCounts[edge.to] ? incomingEdgeCounts[edge.to] + 1 : 1;
    });

    // Find nodes with only one incoming edge
    const nodesToRemove = new Set();
    edges.forEach(edge => {
      if (incomingEdgeCounts[edge.to] === 1) {
        nodesToRemove.add(edge.to);
      }
    });

    // Remove edges leading to nodes with only one incoming edge
    edges = edges.filter(edge => !nodesToRemove.has(edge.to));

    // Remove nodes with only one incoming edge
    nodes = nodes.filter(node => !nodesToRemove.has(node.id));

    res.json({ nodes, edges });
  } catch (error) {
    console.error('Error fetching recommended artists:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/proxy/:url', async (req, res) => {
  const url = 'https://i.scdn.co/image/' + req.params.url;
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    // Send buffer as response
    res.setHeader('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching image');
  }
});

module.exports = router;
