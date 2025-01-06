import React, { useState, useEffect, useCallback } from 'react';
import ConceptForm from './ConceptForm';
import ConceptList from './ConceptList';
import axios from 'axios';

const ConceptTab = () => {
  const [concepts, setConcepts] = useState([]);
  const [editingConcept, setEditingConcept] = useState(null);
  const [conceptsChanged, setConceptsChanged] = useState(0);

  const fetchConcepts = useCallback(async () => {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${serverUrl}/api/concepts`);
      setConcepts(response.data.slice(0, 20));
    } catch (error) {
      console.error('Error fetching concepts:', error);
    }
  }, []);

  useEffect(() => {
    fetchConcepts();
  }, [conceptsChanged, fetchConcepts]);

  const startEditingConcept = (concept) => {
    setEditingConcept(concept);
  };

  const onConceptCreate = () => {
    setConceptsChanged(prev => prev + 1);
  };

  const submitConcept = (newConcept) => {
    setEditingConcept(null);
    onConceptCreate();
  };

  return (
    <>
      <ConceptForm onConceptCreate={onConceptCreate} concept={editingConcept} onConceptSubmit={submitConcept} conceptCount={concepts.length} />
      <ConceptList conceptsChanged={conceptsChanged} onEditStart={startEditingConcept} concepts={concepts} fetchConcepts={fetchConcepts} />
    </>
  );
};

export default ConceptTab;
