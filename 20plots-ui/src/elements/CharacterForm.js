import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Card, Box, CardContent, CardActions, Typography } from '@mui/material';
import './ElementForm.css';

const CharacterForm = ({ onCharacterCreate, character, onCharacterSubmit, characterCount }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (character) {
      setName(character.name);
      setDescription(character.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [character]);

  const submitCharacter = async (event) => {
    event.preventDefault();

    const type = 'character';
    const userId = 0;
    const newCharacter = { userId, type, name, description };
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.post(`${serverUrl}/api/characters`, newCharacter);

      if (onCharacterSubmit) {
        onCharacterSubmit(newCharacter);
      }
      if (onCharacterCreate) {
        onCharacterCreate();
      }
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  return (
    <Card elevation={10} className="element-card">
      <form onSubmit={submitCharacter}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            People You Think Would Make Interesting Characters
          </Typography>

          <Box marginTop={2}>
            <TextField
              label="Character Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Character Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />
          </Box>
        </CardContent>
        <CardActions className="action-buttons">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={characterCount >= 20 || !name || !description}
          >
            {characterCount >= 20 ? "MAX CHARACTERS ADDED" : "Save as New Character"}
          </Button>
        </CardActions>
      </form>
    </Card>
  );
};

export default CharacterForm;
