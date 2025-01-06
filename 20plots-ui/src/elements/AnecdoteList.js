import React, { useState } from 'react';
import axios from 'axios';
import { Box, IconButton, Card, CardContent, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './AnecdoteList.css';

const AnecdoteList = ({ onEditStart, anecdotes, fetchAnecdotes }) => {
  const [activeCard, setActiveCard] = useState(null);
  const [clickedCard, setClickedCard] = useState(null);

  const numAnecdotes = 20;
  const anecdoteArray = anecdotes.length < numAnecdotes ? [...anecdotes, ...Array(numAnecdotes - anecdotes.length).fill()] : anecdotes;

  const deleteAnecdote = async (id, event) => {
    event.stopPropagation(); // Prevent the event from bubbling up to the card
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.delete(`${serverUrl}/api/anecdotes/${id}`);
      fetchAnecdotes();
    } catch (error) {
      console.error('Error deleting anecdote:', error);
    }
  };

  const startEditing = (anecdote) => {
    if (onEditStart) {
      onEditStart(anecdote);
    }
  };

  return (
    <div style={{ margin: "24px 8px 24px 0px" }}>
      <Grid container spacing={3}>
        {anecdoteArray.map((anecdote, index) => (
          <Grid item xs={3} key={index}>
            {anecdote ? (
              <Card
                elevation={10}
                className={`anecdote-card ${activeCard === anecdote.id ? 'active' : ''}`}
                onClick={() => startEditing(anecdote)}
                onMouseDown={() => {
                  setActiveCard(anecdote.id);
                  setClickedCard(anecdote.id);
                }}
                onMouseUp={() => {
                  setActiveCard(null);
                  setClickedCard(null);
                }}
                onMouseLeave={() => setActiveCard(null)}
                onMouseEnter={(e) => {
                  if (e.buttons === 1 && clickedCard === anecdote.id) {
                    setActiveCard(anecdote.id);
                  }
                }}
              >
                <div className="anecdote-card-header">
                  <IconButton aria-label="delete" onClick={(event) => deleteAnecdote(anecdote.id, event)} style={{ position: 'absolute', right: 0 }}>
                    <CloseIcon />
                  </IconButton>
                </div>
                <CardContent className="anecdote-card-content" style={{ paddingTop: '40px' }}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <Typography variant="h7" style={{ fontWeight: 400, marginBottom: '10px', textAlign: 'center' }}>
                      {anecdote.name}
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

export default AnecdoteList;
