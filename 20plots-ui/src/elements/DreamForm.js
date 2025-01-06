import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Card, Box, CardContent, CardActions, Typography } from '@mui/material';
import './ElementForm.css';

const DreamForm = ({ onDreamCreate, dream, onDreamSubmit, dreamCount }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (dream) {
      setName(dream.name);
      setDescription(dream.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [dream]);

  const submitDream = async (event) => {
    event.preventDefault();

    const type = 'dream';
    const userId = 0;
    const newDream = { userId, type, name, description };
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.post(`${serverUrl}/api/dreams`, newDream);

      if (onDreamSubmit) {
        onDreamSubmit(newDream);
      }
      if (onDreamCreate) {
        onDreamCreate();
      }
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating dream:', error);
    }
  };

  return (
    <Card elevation={10} className="element-card">
      <form onSubmit={submitDream}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Dreams That Have Left An Impression
          </Typography>

          <Box marginTop={2}>
            <TextField
              label="Dream Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Dream Description"
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
            disabled={dreamCount >= 20 || !name || !description}
          >
            {dreamCount >= 20 ? "MAX DREAMS ADDED" : "Save as New Dream"}
          </Button>
        </CardActions>
      </form>
    </Card>
  );
};

export default DreamForm;
