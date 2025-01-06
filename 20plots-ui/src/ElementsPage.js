import React, { useState } from 'react';
import { Tab, Tabs, Paper } from '@mui/material';

import CharacterTab from './elements/CharacterTab';
import AnecdoteTab from './elements/AnecdoteTab';
import ConceptTab from './elements/ConceptTab';
import LocationTab from './elements/LocationTab';
import DreamTab from './elements/DreamTab';

const ElementsPage = () => {
    const [value, setValue] = useState(() => {
        const storedTab = localStorage.getItem('selectedTab');
        return storedTab ? parseInt(storedTab, 10) : 0;
    });

    const handleChange = (event, newValue) => {
        localStorage.setItem('selectedTab', newValue);
        setValue(newValue);
    };

    return (
        <div>
            <Paper elevation={10}>
                <Tabs value={value} onChange={handleChange} aria-label="Elements tabs">
                    <Tab label="Characters" />
                    <Tab label="Anecdotes" />
                    <Tab label="Concepts" />
                    <Tab label="Locations" />
                    <Tab label="Dreams" />
                </Tabs>
            </Paper>
            {value === 0 &&
                <CharacterTab />
            }
            {value === 1 &&
                <AnecdoteTab />
            }
            {value === 2 &&
                <ConceptTab />
            }
            {value === 3 &&
                <LocationTab />
            }
            {value === 4 &&
                <DreamTab />
            }
        </div>
    );
}

export default ElementsPage;
