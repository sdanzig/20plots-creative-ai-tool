import React, { useState } from 'react';
import axios from 'axios';
import { Box, IconButton, Card, CardContent, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './CharacterList.css';

const CharacterList = ({ onEditStart, characters, fetchCharacters }) => {
  const [activeCard, setActiveCard] = useState(null);
  const [clickedCard, setClickedCard] = useState(null);

  const numCharacters = 20;
  const characterArray = characters.length < numCharacters ? [...characters, ...Array(numCharacters - characters.length).fill()] : characters;

  const deleteCharacter = async (id, event) => {
    event.stopPropagation(); // Prevent the event from bubbling up to the card
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.delete(`${serverUrl}/api/characters/${id}`);
      fetchCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const startEditing = (character) => {
    if (onEditStart) {
      onEditStart(character);
    }
  };

  return (
    <div style={{ margin: "24px 8px 24px 0px" }}>
      <Grid container spacing={3}>
        {characterArray.map((character, index) => (
          <Grid item xs={3} key={index}>
            {character ? (
              <Card
                elevation={10}
                className={`character-card ${activeCard === character.id ? 'active' : ''}`}
                onClick={() => startEditing(character)}
                onMouseDown={() => {
                  setActiveCard(character.id);
                  setClickedCard(character.id);
                }}
                onMouseUp={() => {
                  setActiveCard(null);
                  setClickedCard(null);
                }}
                onMouseLeave={() => setActiveCard(null)}
                onMouseEnter={(e) => {
                  if (e.buttons === 1 && clickedCard === character.id) {
                    setActiveCard(character.id);
                  }
                }}
              >
                <div className="character-card-header">
                  <IconButton aria-label="delete" onClick={(event) => deleteCharacter(character.id, event)} style={{ position: 'absolute', right: 0 }}>
                    <CloseIcon />
                  </IconButton>
                </div>
                <CardContent className="character-card-content" style={{ paddingTop: '40px' }}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <Typography variant="h7" style={{ fontWeight: 400, marginBottom: '10px', textAlign: 'center' }}>
                      {character.name}
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

export default CharacterList;
