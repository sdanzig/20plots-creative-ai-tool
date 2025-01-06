import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Card, Box, CardContent, CardActions, Typography } from '@mui/material';
import './ElementForm.css';

const AnecdoteForm = ({ onAnecdoteCreate, anecdote, onAnecdoteSubmit, anecdoteCount }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (anecdote) {
      setName(anecdote.name);
      setDescription(anecdote.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [anecdote]);

  const submitAnecdote = async (event) => {
    event.preventDefault();

    const type = 'anecdote';
    const userId = 0;
    const newAnecdote = { userId, type, name, description };
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.post(`${serverUrl}/api/anecdotes`, newAnecdote);

      if (onAnecdoteSubmit) {
        onAnecdoteSubmit(newAnecdote);
      }
      if (onAnecdoteCreate) {
        onAnecdoteCreate();
      }
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating anecdote:', error);
    }
  };

  return (
    <Card elevation={10} className="element-card">
      <form onSubmit={submitAnecdote}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Memorable Things That Have Happened
          </Typography>

          <Box marginTop={2}>
            <TextField
              label="Anecdote Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Anecdote Description"
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
            disabled={anecdoteCount >= 20 || !name || !description}
          >
            {anecdoteCount >= 20 ? "MAX ANECDOTES ADDED" : "Save as New Anecdote"}
          </Button>
        </CardActions>
      </form>
    </Card>
  );
};

export default AnecdoteForm;
