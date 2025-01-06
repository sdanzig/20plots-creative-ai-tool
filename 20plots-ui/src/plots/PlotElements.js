import React from 'react';
import { Box, Typography, List, Card, CardContent, ListItemText, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';

const getChipColor = (type) => {
    switch (type) {
        case 'character':
            return 'primary';
        case 'anecdote':
            return 'secondary';
        case 'concept':
            return 'warning';
        case 'location':
            return 'info';
        case 'dream':
            return 'success';
        case 'custom':
        default:
            return 'default';
    }
};

const PlotElements = ({ elements, removeCustomElement }) => (
    <Box marginTop={2}>
        <Typography variant="h6" gutterBottom color="primary.main">
            Plot Elements
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center">
            <List style={{ width: '100%' }}>
                {elements.map((element, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
                        <Card elevation={3} style={{ width: '100%' }}>
                            <CardContent>
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" mb={1.5}> {/* The Box now has a margin-bottom */}
                                            <Chip size="small" color={getChipColor(element.type)} label={element.type} className="element-chip" />
                                            <Box ml={1}>{element.name}</Box>
                                        </Box>
                                    }
                                    secondary={element.description}
                                />
                            </CardContent>
                            <IconButton
                                style={{ position: 'absolute', right: '10px', top: '10px' }}
                                edge="end"
                                aria-label="delete"
                                onClick={() => removeCustomElement(index)}>
                                <CloseIcon />
                            </IconButton>
                        </Card>
                    </div>
                ))}
            </List>
        </Box>
    </Box>
);

export default PlotElements;
