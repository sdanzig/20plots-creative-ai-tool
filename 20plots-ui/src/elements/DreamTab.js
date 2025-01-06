import React, { useState, useEffect, useCallback } from 'react';
import DreamForm from './DreamForm';
import DreamList from './DreamList';
import axios from 'axios';

const DreamTab = () => {
  const [dreams, setDreams] = useState([]);
  const [editingDream, setEditingDream] = useState(null);
  const [dreamsChanged, setDreamsChanged] = useState(0);

  const fetchDreams = useCallback(async () => {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${serverUrl}/api/dreams`);
      setDreams(response.data.slice(0, 20));
    } catch (error) {
      console.error('Error fetching dreams:', error);
    }
  }, []);

  useEffect(() => {
    fetchDreams();
  }, [dreamsChanged, fetchDreams]);

  const startEditingDream = (dream) => {
    setEditingDream(dream);
  };

  const onDreamCreate = () => {
    setDreamsChanged(prev => prev + 1);
  };

  const submitDream = (newDream) => {
    setEditingDream(null);
    onDreamCreate();
  };

  return (
    <>
      <DreamForm onDreamCreate={onDreamCreate} dream={editingDream} onDreamSubmit={submitDream} dreamCount={dreams.length} />
      <DreamList dreamsChanged={dreamsChanged} onEditStart={startEditingDream} dreams={dreams} fetchDreams={fetchDreams} />
    </>
  );
};

export default DreamTab;
