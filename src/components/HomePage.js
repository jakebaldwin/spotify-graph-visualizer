import React, { useState, useEffect, useRef} from 'react';
import Graph from "react-graph-vis";
import '../css/HomePage.css';
import { AiOutlineUpload } from "react-icons/ai";
import html2canvas from 'html2canvas'; 

const HomePage = ({onLogout}) => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({
    layout: {
      improvedLayout: true,
    },
    nodes: {
      shape: 'circularImage',
      borderWidth: 3,
      chosen: false,
      size: 80,
      font: {
        color: '#000',
        size: 22,
        face: 'Indie Flower',
      },
      group: 'topArtist', // Place nodes in the "topArtist" group on the outside
    },
    groups: {
      topArtist: {
        color: {
          border: '#FFD700',
          background: '#ffffff',
        },
        size: 130,
        font: {
          color: '#FFD700',
          size: 35,
          face: 'Bungee',
        }
      },
    },
    physics: {
    
      barnesHut: {
        springConstant: 0,
        avoidOverlap: 1.5
      },
    },
    edges: {
      arrows: {
        to: { enabled: false },
      },
      length: 650,
    },
    interaction: {
      dragView: true,
      zoomView: true,
    },
  });

  useEffect(() => {
    const updateSizes = () => {
      const parentContainer = document.getElementById('graph-network');
      if (parentContainer) {
        const containerWidth = parentContainer.clientWidth;
        const containerHeight = parentContainer.clientHeight;

        // Calculate the size of nodes and groups based on container size
        const nodeSize = Math.min(containerWidth, containerHeight) * 0.10; // Adjust as needed
        const groupSize = Math.min(containerWidth, containerHeight) * 0.20; // Adjust as needed

        // Update options with new sizes
        setOptions({
          ...options,
          nodes: {
            ...options.nodes,
            size: nodeSize,
          },
          groups: {
            ...options.groups,
            topArtist: {
              ...options.groups.topArtist,
              size: groupSize,
            },
          },
          edges: {
            ...options.edges,
            length: Math.min(containerWidth, containerHeight) * 0.05, // Adjust as needed
          },
        });
      }
    };

    updateSizes();
  }, []);


  function getNodePositions(containerWidth, containerHeight) {
    const positions = [
      { x: 0, y: 0 },
      { x: containerWidth, y: 0 },
      { x: 0, y: containerHeight },
      { x: containerWidth, y: containerHeight },
      { x: containerWidth / 2, y: containerHeight / 2 }
    ];
    return positions;
  }
  
  function getContainerDimensions(parentElement) {
    
    if (!parentElement) {
      console.error('Parent container element not found.');
      return { width: 0, height: 0 };
    }
    
    const width = parentElement.clientWidth;
    const height = parentElement.clientHeight;
    
    return { width, height };
  }

  
  const handleShare = () => {
    
    html2canvas(document.getElementById('graph-network'), {backgroundColor: '#ADD8E6'})
        .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = imgData;
            a.download = 'graph.png';
            a.click();
        })
        .catch((error) => {
            console.error(error);

            // Handle any errors here
        });
  };
  
  
  const parentRef = useRef(null);

  useEffect(() => {
    parentRef.current = document.getElementById('graph-network');
  }, []);

  useEffect(() => {
    if (!parentRef.current) return; // Exit early if parent element is not available
    
    const fetchGraphData = async () => {
      try {
        const response = await fetch('/api/recommendedArtists');
        if (!response.ok) {
          throw new Error(`Failed to fetch graph data: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        
        const { width, height } = getContainerDimensions(parentRef.current);
        

        let index = 0;
        const nodes = data.nodes.map(node => {
          if (node.isTopArtist) {
            index++; // Move to the next position
            return { ...node, group: 'topArtist' };
          } else {
            return { ...node, group: undefined };
          }
        });
        
        setGraphData({ ...data, nodes });
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [parentRef.current]); 
  

  if (loading || !graphData) {
    return <div id='graph-network' className='graphcontainer'><p>Loading...</p></div>;
  }

  return (
    <div className="HomePage" style={{ width: '100%', height: '100%' }}>
      <div className="navbar">
        <div className="logo">
          <img src='vail.jpeg' alt="Logo" />
        </div>
        <div className="navbar-buttons">
        <button onClick={() => window.open('https://jakebaldwin.org', '_blank')}>About</button>
        <button onClick={onLogout}>Logout</button>
        </div>
      </div>      

      <div className="sharecontainer" style={{color: '#ADD8E6'}}>
        <button className="share-button" onClick={() => handleShare()}>
          
        <AiOutlineUpload fill={'#ADD8E6'} stroke={'#ADD8E6'} size={32} className="shareicon" />

        </button>
      </div>
      <div id='graph-network' className='graphcontainer'>
      <Graph
        graph={graphData}
        options={options}
      />
      </div>
    </div>
  );
}

export default HomePage;
