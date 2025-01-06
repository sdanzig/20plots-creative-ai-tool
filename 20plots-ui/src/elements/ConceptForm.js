import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Card, Box, CardContent, CardActions, Typography } from '@mui/material';
import './ElementForm.css';

const ConceptForm = ({ onConceptCreate, concept, onConceptSubmit, conceptCount }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (concept) {
      setName(concept.name);
      setDescription(concept.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [concept]);

  const submitConcept = async (event) => {
    event.preventDefault();

    const type = 'concept';
    const userId = 0;
    const newConcept = { userId, type, name, description };
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.post(`${serverUrl}/api/concepts`, newConcept);

      if (onConceptSubmit) {
        onConceptSubmit(newConcept);
      }
      if (onConceptCreate) {
        onConceptCreate();
      }
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating concept:', error);
    }
  };

  return (
    <Card elevation={10} className="element-card">
      <form onSubmit={submitConcept}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Concepts You Want To See In A Story
          </Typography>

          <Box marginTop={2}>
            <TextField
              label="Concept Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Concept Description"
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
            disabled={conceptCount >= 20 || !name || !description}
          >
            {conceptCount >= 20 ? "MAX CONCEPTS ADDED" : "Save as New Concept"}
          </Button>
        </CardActions>
      </form>
    </Card>
  );
};

export default ConceptForm;
