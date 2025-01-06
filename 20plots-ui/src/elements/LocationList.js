import React, { useState } from 'react';
import axios from 'axios';
import { Box, IconButton, Card, CardContent, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './LocationList.css';

const LocationList = ({ onEditStart, locations, fetchLocations }) => {
  const [activeCard, setActiveCard] = useState(null);
  const [clickedCard, setClickedCard] = useState(null);

  const numLocations = 20;
  const locationArray = locations.length < numLocations ? [...locations, ...Array(numLocations - locations.length).fill()] : locations;

  const deleteLocation = async (id, event) => {
    event.stopPropagation(); // Prevent the event from bubbling up to the card
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.delete(`${serverUrl}/api/locations/${id}`);
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const startEditing = (location) => {
    if (onEditStart) {
      onEditStart(location);
    }
  };

  return (
    <div style={{ margin: "24px 8px 24px 0px" }}>
      <Grid container spacing={3}>
        {locationArray.map((location, index) => (
          <Grid item xs={3} key={index}>
            {location ? (
              <Card
                elevation={10}
                className={`location-card ${activeCard === location.id ? 'active' : ''}`}
                onClick={() => startEditing(location)}
                onMouseDown={() => {
                  setActiveCard(location.id);
                  setClickedCard(location.id);
                }}
                onMouseUp={() => {
                  setActiveCard(null);
                  setClickedCard(null);
                }}
                onMouseLeave={() => setActiveCard(null)}
                onMouseEnter={(e) => {
                  if (e.buttons === 1 && clickedCard === location.id) {
                    setActiveCard(location.id);
                  }
                }}
              >
                <div className="location-card-header">
                  <IconButton aria-label="delete" onClick={(event) => deleteLocation(location.id, event)} style={{ position: 'absolute', right: 0 }}>
                    <CloseIcon />
                  </IconButton>
                </div>
                <CardContent className="location-card-content" style={{ paddingTop: '40px' }}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <Typography variant="h7" style={{ fontWeight: 400, marginBottom: '10px', textAlign: 'center' }}>
                      {location.name}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'darkgray', fontWeight: 'bold', fontSize: '2em', height: '110px', width: '200px', margin: 'auto' }}>
                {index + 1}
              </div>
            )}
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default LocationList;
