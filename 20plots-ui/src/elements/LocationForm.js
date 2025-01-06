import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Card, Box, CardContent, CardActions, Typography } from '@mui/material';
import './ElementForm.css';

const LocationForm = ({ onLocationCreate, location, onLocationSubmit, locationCount }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (location) {
      setName(location.name);
      setDescription(location.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [location]);

  const submitLocation = async (event) => {
    event.preventDefault();

    const type = 'location';
    const userId = 0;
    const newLocation = { userId, type, name, description };
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      await axios.post(`${serverUrl}/api/locations`, newLocation);

      if (onLocationSubmit) {
        onLocationSubmit(newLocation);
      }
      if (onLocationCreate) {
        onLocationCreate();
      }
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  return (
    <Card elevation={10} className="element-card">
      <form onSubmit={submitLocation}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Places You Appreciate
          </Typography>

          <Box marginTop={2}>
            <TextField
              label="Location Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Location Description"
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
            disabled={locationCount >= 20 || !name || !description}
          >
            {locationCount >= 20 ? "MAX LOCATIONS ADDED" : "Save as New Location"}
          </Button>
        </CardActions>
      </form>
    </Card>
  );
};

export default LocationForm;
