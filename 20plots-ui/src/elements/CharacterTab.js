import React, { useState, useEffect, useCallback } from 'react';
import CharacterForm from './CharacterForm';
import CharacterList from './CharacterList';
import axios from 'axios';

const CharacterTab = () => {
  const [characters, setCharacters] = useState([]);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [charactersChanged, setCharactersChanged] = useState(0);

  const fetchCharacters = useCallback(async () => {
    const serverUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.get(`${serverUrl}/api/characters`);
      setCharacters(response.data.slice(0, 20));
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [charactersChanged, fetchCharacters]);

  const startEditingCharacter = (character) => {
    setEditingCharacter(character);
  };

  const onCharacterCreate = () => {
    setCharactersChanged(prev => prev + 1);
  };

  const submitCharacter = (newCharacter) => {
    setEditingCharacter(null);
    onCharacterCreate();
  };

  return (
    <>
      <CharacterForm onCharacterCreate={onCharacterCreate} character={editingCharacter} onCharacterSubmit={submitCharacter} characterCount={characters.length} />
      <CharacterList charactersChanged={charactersChanged} onEditStart={startEditingCharacter} characters={characters} fetchCharacters={fetchCharacters} />
    </>
  );
};

export default CharacterTab;
