import React from 'react';
import { Box, Card, CardContent, TextField, CardActions, Button, Typography } from '@mui/material';

const CustomElement = ({ customElementName, setCustomElementName, customElementDescription, setCustomElementDescription, addCustomElement }) => (
    <Box marginTop={2}>
        <Card elevation={3} style={{ width: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom color="primary.main">
                    Add a Custom Element
                </Typography>
                <TextField
                    label="Custom Element Name"
                    value={customElementName}
                    onChange={(e) => setCustomElementName(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label="Custom Element Description"
                    value={customElementDescription}
                    onChange={(e) => setCustomElementDescription(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                />
            </CardContent>
            <CardActions>
                <Box display="flex" justifyContent="flex-end" marginY={2}>
                    <Button variant="contained" color="primary" onClick={addCustomElement}>
                        Add Custom Element
                    </Button>
                </Box>
            </CardActions>
        </Card>
    </Box>
);

export default CustomElement;
