import React, { useState } from 'react';
import axios from 'axios';
import { Box, IconButton, Card, CardContent, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './DreamList.css';

const DreamList = ({ onEditStart, dreams, fetchDreams }) => {
  const [activeCard, setActiveCard] = useState(null);
  const [clickedCard, setClickedCard] = useState(null);

  const numDreams = 20;
  const dreamArray = dreams.length < numDreams ? [...dreams, ...Array(numDreams - dreams.length).fill()] : dreams;

  const deleteDream = async (id, event) => {
    event.stopPropagation(); // Prevent the event from bubbling up to the card
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.delete(`${serverUrl}/api/dreams/${id}`);
      fetchDreams();
    } catch (error) {
      console.error('Error deleting dream:', error);
    }
  };

  const startEditing = (dream) => {
    if (onEditStart) {
      onEditStart(dream);
    }
  };

  return (
    <div style={{ margin: "24px 8px 24px 0px" }}>
      <Grid container spacing={3}>
        {dreamArray.map((dream, index) => (
          <Grid item xs={3} key={index}>
            {dream ? (
              <Card
                elevation={10}
                className={`dream-card ${activeCard === dream.id ? 'active' : ''}`}
                onClick={() => startEditing(dream)}
                onMouseDown={() => {
                  setActiveCard(dream.id);
                  setClickedCard(dream.id);
                }}
                onMouseUp={() => {
                  setActiveCard(null);
                  setClickedCard(null);
                }}
                onMouseLeave={() => setActiveCard(null)}
                onMouseEnter={(e) => {
                  if (e.buttons === 1 && clickedCard === dream.id) {
                    setActiveCard(dream.id);
                  }
                }}
              >
                <div className="dream-card-header">
                  <IconButton aria-label="delete" onClick={(event) => deleteDream(dream.id, event)} style={{ position: 'absolute', right: 0 }}>
                    <CloseIcon />
                  </IconButton>
                </div>
                <CardContent className="dream-card-content" style={{ paddingTop: '40px' }}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <Typography variant="h7" style={{ fontWeight: 400, marginBottom: '10px', textAlign: 'center' }}>
                      {dream.name}
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

export default DreamList;
