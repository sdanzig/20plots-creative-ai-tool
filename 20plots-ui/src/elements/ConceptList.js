import React, { useState } from 'react';
import axios from 'axios';
import { Box, IconButton, Card, CardContent, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './ConceptList.css';

const ConceptList = ({ onEditStart, concepts, fetchConcepts }) => {
  const [activeCard, setActiveCard] = useState(null);
  const [clickedCard, setClickedCard] = useState(null);

  const numConcepts = 20;
  const conceptArray = concepts.length < numConcepts ? [...concepts, ...Array(numConcepts - concepts.length).fill()] : concepts;

  const deleteConcept = async (id, event) => {
    event.stopPropagation(); // Prevent the event from bubbling up to the card
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.delete(`${serverUrl}/api/concepts/${id}`);
      fetchConcepts();
    } catch (error) {
      console.error('Error deleting concept:', error);
    }
  };

  const startEditing = (concept) => {
    if (onEditStart) {
      onEditStart(concept);
    }
  };

  return (
    <div style={{ margin: "24px 8px 24px 0px" }}>
      <Grid container spacing={3}>
        {conceptArray.map((concept, index) => (
          <Grid item xs={3} key={index}>
            {concept ? (
              <Card
                elevation={10}
                className={`concept-card ${activeCard === concept.id ? 'active' : ''}`}
                onClick={() => startEditing(concept)}
                onMouseDown={() => {
                  setActiveCard(concept.id);
                  setClickedCard(concept.id);
                }}
                onMouseUp={() => {
                  setActiveCard(null);
                  setClickedCard(null);
                }}
                onMouseLeave={() => setActiveCard(null)}
                onMouseEnter={(e) => {
                  if (e.buttons === 1 && clickedCard === concept.id) {
                    setActiveCard(concept.id);
                  }
                }}
              >
                <div className="concept-card-header">
                  <IconButton aria-label="delete" onClick={(event) => deleteConcept(concept.id, event)} style={{ position: 'absolute', right: 0 }}>
                    <CloseIcon />
                  </IconButton>
                </div>
                <CardContent className="concept-card-content" style={{ paddingTop: '40px' }}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <Typography variant="h7" style={{ fontWeight: 400, marginBottom: '10px', textAlign: 'center' }}>
                      {concept.name}
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

export default ConceptList;
