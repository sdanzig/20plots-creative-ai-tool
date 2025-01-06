import React, { useState } from 'react';
import { Drawer, Box } from '@mui/material';
import CustomElement from './CustomElement';
import PlotElements from './PlotElements';

const ElementsDrawer = ({ drawerOpen, setDrawerOpen, elements, setElements }) => {
  const [customElementName, setCustomElementName] = useState('');
  const [customElementDescription, setCustomElementDescription] = useState('');

  const addCustomElement = () => {
    const newElement = { type: 'custom', name: customElementName, description: customElementDescription };
    setElements(oldElements => [...oldElements, newElement]);
    setCustomElementName('');
    setCustomElementDescription('');
  };

  const removeCustomElement = (index) => {
    setElements(oldElements => oldElements.filter((_, i) => i !== index));
  };

  return (
    <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box width={500} padding={3}>
        <CustomElement
          customElementName={customElementName}
          setCustomElementName={setCustomElementName}
          customElementDescription={customElementDescription}
          setCustomElementDescription={setCustomElementDescription}
          addCustomElement={addCustomElement}
        />
        <PlotElements elements={elements} removeCustomElement={removeCustomElement} />
      </Box>
    </Drawer>
  );
};

export default ElementsDrawer;
