import React, { useState, useEffect, useCallback } from 'react';
import AnecdoteForm from './AnecdoteForm';
import AnecdoteList from './AnecdoteList';
import axios from 'axios';

const AnecdoteTab = () => {
  const [anecdotes, setAnecdotes] = useState([]);
  const [editingAnecdote, setEditingAnecdote] = useState(null);
  const [anecdotesChanged, setAnecdotesChanged] = useState(0);

  const fetchAnecdotes = useCallback(async () => {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${serverUrl}/api/anecdotes`);
      setAnecdotes(response.data.slice(0, 20));
    } catch (error) {
      console.error('Error fetching anecdotes:', error);
    }
  }, []);

  useEffect(() => {
    fetchAnecdotes();
  }, [anecdotesChanged, fetchAnecdotes]);

  const startEditingAnecdote = (anecdote) => {
    setEditingAnecdote(anecdote);
  };

  const onAnecdoteCreate = () => {
    setAnecdotesChanged(prev => prev + 1);
  };

  const submitAnecdote = (newAnecdote) => {
    setEditingAnecdote(null);
    onAnecdoteCreate();
  };

  return (
    <>
      <AnecdoteForm onAnecdoteCreate={onAnecdoteCreate} anecdote={editingAnecdote} onAnecdoteSubmit={submitAnecdote} anecdoteCount={anecdotes.length} />
      <AnecdoteList anecdotesChanged={anecdotesChanged} onEditStart={startEditingAnecdote} anecdotes={anecdotes} fetchAnecdotes={fetchAnecdotes} />
    </>
  );
};

export default AnecdoteTab;
