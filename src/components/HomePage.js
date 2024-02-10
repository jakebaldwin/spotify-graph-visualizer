import React, { useState, useEffect } from 'react';
import Graph from "react-graph-vis";

function App() {
  const [graphData, setGraphData] = useState(null); // Initialize graphData as null
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({
    layout: {
      improvedLayout: true,
      clusterThreshold: 200
    },
    nodes: {
      shape: 'circularImage',
      borderWidth: 3,
      chosen: false,
      size: 40,
    },
    groups: {
      topArtist: { // Define group for top artists
        color: {
          border: 'gold', // Gold border color
          background: '#ffffff', // White background color
          
        },
        size: 80
      },
    },
    edges: {
      arrows: {
        to: { enabled: false },
      },
    },
    physics: false, // Disable physics during initial loading
  });

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('/api/recommendedArtists');
        if (!response.ok) {
          throw new Error(`Failed to fetch graph data: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        // Assign nodes to groups based on topArtist boolean
        const nodes = data.nodes.map(node => ({
          ...node,
          group: node.isTopArtist ? 'topArtist' : undefined,
        }));
        setGraphData({ ...data, nodes });
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  if (loading || !graphData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="App" style={{ width: '100%', height: '100%' }}>
      <Graph
        graph={graphData}
        options={options}
        events={{
          stabilizationIterationsDone: () => {
            // Enable physics after stabilization (graph rendering completed)
            setOptions({ ...options, physics: true });
          },
        }}
        getNetwork={network => {
          network.fit(); // Fit the graph to the container
        }}
      />
    </div>
  );
}

export default App;
