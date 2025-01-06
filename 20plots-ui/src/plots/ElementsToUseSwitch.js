import React from 'react';
import { Box, Switch } from '@mui/material';

const ElementsToUseSwitch = ({ useCurrentElements, setUseCurrentElements, elements, setIsModified, plotCount }) => {
    const handleChange = (event) => {
        setUseCurrentElements(event.target.checked);
        setIsModified(true);
    };

    const isDisabled = !elements || elements.length === 0 || plotCount >= 20;

    return (
        <Box display="flex" flexDirection="row" alignItems="center" color={isDisabled ? 'gray' : 'initial'}>
            <Box
                component="span"
                fontSize={10}
                mr={0}
                mt={1.4}
                p={0.5}
                borderRadius={1}
                style={{
                    backgroundColor: !isDisabled && !useCurrentElements ? 'lightblue' : 'transparent'
                }}
            >
                Random
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Box component="span" fontSize={10}>Elements to use</Box>
                <Switch
                    checked={useCurrentElements && !isDisabled}
                    onChange={handleChange}
                    name="useCurrentElements"
                    color="primary"
                    disabled={isDisabled}
                />
            </Box>
            <Box
                component="span"
                fontSize={10}
                ml={0}
                mt={1.4}
                p={0.5}
                borderRadius={1}
                style={{
                    backgroundColor: !isDisabled && useCurrentElements ? 'lightblue' : 'transparent'
                }}
            >
                Currently selected
            </Box>
        </Box>
    );
};

export default ElementsToUseSwitch;
