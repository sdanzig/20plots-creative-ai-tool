import React, { useState, useEffect, useCallback } from 'react';
import LocationForm from './LocationForm';
import LocationList from './LocationList';
import axios from 'axios';

const LocationTab = () => {
  const [locations, setLocations] = useState([]);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationsChanged, setLocationsChanged] = useState(0);

  const fetchLocations = useCallback(async () => {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${serverUrl}/api/locations`);
      setLocations(response.data.slice(0, 20));
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [locationsChanged, fetchLocations]);

  const startEditingLocation = (location) => {
    setEditingLocation(location);
  };

  const onLocationCreate = () => {
    setLocationsChanged(prev => prev + 1);
  };

  const submitLocation = (newLocation) => {
    setEditingLocation(null);
    onLocationCreate();
  };

  return (
    <>
      <LocationForm onLocationCreate={onLocationCreate} location={editingLocation} onLocationSubmit={submitLocation} locationCount={locations.length} />
      <LocationList locationsChanged={locationsChanged} onEditStart={startEditingLocation} locations={locations} fetchLocations={fetchLocations} />
    </>
  );
};

export default LocationTab;
