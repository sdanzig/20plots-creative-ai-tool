import React, { useState } from 'react';
import axios from 'axios';
import { Box, IconButton, Card, CardContent, Grid, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './PlotList.css';

const PlotList = ({ onEditStart, plots, setPlotChanged, generating, editingPlot, setIsModified }) => {
    const [activeCard, setActiveCard] = useState(null);
    const [clickedCard, setClickedCard] = useState(null);

    const numPlots = 20;
    const plotArray = plots.length < numPlots ? [...plots, ...Array(numPlots - plots.length).fill()] : plots;

    const deletePlot = async (id, event) => {
        event.stopPropagation();
        const serverUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            await axios.delete(`${serverUrl}/api/plots/${id}`);
            setPlotChanged(true);
            if(editingPlot != null && editingPlot.lastPlotIdLoaded === id) {
                setIsModified(true);
            }
        } catch (error) {
            console.error('Error deleting plot:', error);
        }
    };

    const startEditing = (plot) => {
        if (onEditStart) {
            onEditStart(plot);
        }
    };

    return (
        <div style={{ margin: "24px 8px 24px 0px" }}>
            <Grid container spacing={3}>
                {plotArray.map((plot, index) => (
                    <Grid item xs={3} key={index}>
                        {plot ? (
                            <Card
                                elevation={10}
                                className={`plot-card ${activeCard === plot.id ? 'active' : ''}`}
                                onClick={() => startEditing(plot)}
                                onMouseDown={() => {
                                    setActiveCard(plot.id);
                                    setClickedCard(plot.id);
                                }}
                                onMouseUp={() => {
                                    setActiveCard(null);
                                    setClickedCard(null);
                                }}
                                onMouseLeave={() => setActiveCard(null)}
                                onMouseEnter={(e) => {
                                    if (e.buttons === 1 && clickedCard === plot.id) {
                                        setActiveCard(plot.id);
                                    }
                                }}
                            >
                                <div className="plot-card-header">
                                    <IconButton aria-label="delete" onClick={(event) => deletePlot(plot.id, event)} style={{ position: 'absolute', right: 0 }}>
                                        <CloseIcon />
                                    </IconButton>
                                    <Typography style={{ position: 'absolute', left: 16, top: 8 }}>
                                        {plot.genre}
                                    </Typography>
                                </div>
                                <CardContent className="plot-card-content" style={{ paddingTop: '40px' }}>
                                    <Box overflow="hidden" textOverflow="ellipsis">
                                        <Typography variant="h7" style={{ fontWeight: 400, marginBottom: '10px', textAlign: 'center' }}>
                                            {plot.title}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'darkgray', fontWeight: 'bold', fontSize: '2em', height: '110px', width: '200px', margin: 'auto' }}>
                                {generating && index === plots.length ? "Generating..." : index + 1}
                            </div>)}
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default PlotList;
