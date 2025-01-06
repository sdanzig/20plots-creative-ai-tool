import React, { useState, useEffect } from 'react';
import { TextField, Button, Card, Box, CardContent, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import GenreSelect from './GenreSelect';
import ElementsDrawer from './ElementsDrawer';
import ElementsToUseSwitch from './ElementsToUseSwitch';
import DelayedTooltip from '../DelayedTooltip';
import SampleFormatSelect from './SampleFormatSelect';
import './PlotForm.css';

const PlotForm = ({ onPlotsChanged, onEditingPlotChanged, plot, plotCount, startGenerating, isModified, setIsModified }) => {
    // eslint-disable-next-line no-unused-vars
    const [lastPlotIdLoaded, setLastPlotIdLoaded] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [elements, setElements] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [genre, setGenre] = useState('');
    const [useCurrentElements, setUseCurrentElements] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [sample, setSample] = useState('');
    const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
    const [sampleFormat, setSampleFormat] = useState('');
    const [aiButtonsDisabled, setAIButtonsDisabled] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (plot) {
            setLastPlotIdLoaded(plot.id);
            setTitle(plot.title);
            setDescription(plot.description);
            setGenre(plot.genre || '');
            setElements(plot.selectedElements || []);

        } else {
            setTitle('');
            setDescription('');
            setGenre('');
            setElements([]);
        }
        setIsModified(false);
    }, [plot, setIsModified, setLastPlotIdLoaded]);

    const generatePlot = async () => {
        if (useCurrentElements && elements.length === 0) {
            enqueueSnackbar('No selected elements. Please select at least one element.', { variant: 'warning' });
            return;
        }
        try {
            setAIButtonsDisabled(true);
            const elementsData = useCurrentElements ? elements : [];
            const serverUrl = process.env.REACT_APP_BACKEND_URL;
            startGenerating(true);
            await axios.post(
                `${serverUrl}/api/plots/generate?genre=${encodeURIComponent(genre)}`,
                {
                    selectedElements: elementsData,
                    useCurrentElements: useCurrentElements,
                }
            );
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400 && error.response.data === 'No elements created') {
                    enqueueSnackbar('No elements created. Please create at least one element.', { variant: 'error' });
                } else if (error.response.status === 503) {
                    enqueueSnackbar('Server Overloaded. Try again later.', { variant: 'error' });
                } else {
                    enqueueSnackbar('Failed to generate plot', { variant: 'error' });
                }
            } else {
                enqueueSnackbar('Failed to generate plot', { variant: 'error' });
            }
        }
        enqueueSnackbar('Generating a "'+genre+'" plot. Just a moment...', { variant: 'success', autoHideDuration: 2000 });
    };

    const savePlot = async () => {
        try {
            const plotData = {
                title: title,
                description: description,
                genre: genre,
                elements: elements
            };
    
            const serverUrl = process.env.REACT_APP_BACKEND_URL;
            await axios.post(`${serverUrl}/api/plots`, plotData);
    
            if (onPlotsChanged) {
                onPlotsChanged(true);
            }
        } catch (error) {
            enqueueSnackbar('Failed to save plot', { variant: 'error' });
        } finally {
            enqueueSnackbar('Plot saved successfully', { variant: 'success', autoHideDuration: 2000 });
            setIsModified(false);
        }
    };

    const generateSample = () => {
        if (!plot) return;

        let plotWithSample = plot;
        if (!plot.samples || !plot.samples.find(sample => sample.format === sampleFormat)) {
            try {
                const serverUrl = process.env.REACT_APP_BACKEND_URL;
                const token = "Bearer " + window.localStorage.getItem('token');
                let url = `${serverUrl}/api/plots/${plot.id}/samples/get-or-create?sampleFormat=${encodeURIComponent(sampleFormat)}&token=${encodeURIComponent(token)}`;
                setIsStreaming(true);
                setSampleDialogOpen(true);

                const eventSource = new EventSource(url);

                eventSource.addEventListener('complete', function (event) {
                    eventSource.close();
                    setIsStreaming(false);
                }, false);

                eventSource.onmessage = function (event) {
                    let newChunk = atob(event.data);
                    newChunk = replaceSpecialCharacters(newChunk);
                    setSample((prevSampleText) => prevSampleText + newChunk);
                };

                eventSource.onerror = function (event) {
                    console.log("eventSource.onerror received. event: ", event);
                    if (eventSource.readyState === EventSource.CLOSED) {
                        console.log('Connection closed.');
                    }
                    eventSource.close();
                    setIsStreaming(false);
                };

                eventSource.onopen = function (event) {
                };

            } catch (error) {
                console.log("error caught when generating sample: ", error);
            }
        }
        onEditingPlotChanged(plotWithSample);
    };

    const replaceSpecialCharacters = (text) => {
        return text.replace(/[\u00A0-\u9999<>&]/gim, function (i) {
            return '&#' + i.charCodeAt(0) + ';';
        });
    }
    const buttonHeight = "40px";
    const isElementsButtonDisabled = !elements || elements.length === 0;

    return (
        <Card elevation={10} className="plot-form-card">
            <form onSubmit={(e) => e.preventDefault()}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Plots with Personal Connections
                    </Typography>
                    <Box marginTop={2} display="flex" alignItems="center">
                        <Box marginTop={2} display="flex" justifyContent="space-between" alignItems="center" width="100%">
                            <Box display="flex" alignItems="center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={generatePlot}
                                    disabled={aiButtonsDisabled || !genre || plotCount >= 20}
                                    style={{ height: buttonHeight, marginRight: "20px" }}
                                >
                                    {plotCount >= 20 ? "MAX PLOTS ADDED" : "Generate Plot"}
                                </Button>
                                <GenreSelect genre={genre} setGenre={setGenre} setIsModified={setIsModified} plot={plot} />
                                <Box marginLeft={2}>
                                    <ElementsToUseSwitch
                                        className="noMarginSwitch"
                                        useCurrentElements={useCurrentElements}
                                        setUseCurrentElements={setUseCurrentElements}
                                        elements={elements}
                                        setIsModified={setIsModified}
                                        plotCount={plotCount}
                                    />
                                </Box>
                            </Box>
                            <DelayedTooltip title="View the elements used in a plot, or modify them and generate a new one!">
                                <Button
                                    variant="contained"
                                    style={{
                                        height: buttonHeight,
                                    }}
                                    onClick={() => setDrawerOpen(true)}
                                    disabled={isElementsButtonDisabled}
                                >
                                    Select Elements
                                </Button>
                            </DelayedTooltip>
                        </Box>
                    </Box>
                    <Box marginTop={2}>
                        <TextField
                            label="Title"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setIsModified(true);
                                plot.title = e.target.value;
                                
                            }}
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setIsModified(true);
                                plot.description = e.target.value;
                            }}
                            multiline
                            rows={4}
                            fullWidth
                            margin="normal"
                        />
                    </Box>
                    <div className="lower-form-buttons" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button style={{ height: buttonHeight }} variant="contained" color="primary" disabled={!isModified || plotCount >= 20} onClick={savePlot}>
                            {plotCount >= 20 ? "MAX PLOTS ADDED" : "Save as New Plot"}
                        </Button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Button
                                variant="contained"
                                onClick={generateSample}
                                disabled={aiButtonsDisabled || !plot || !sampleFormat || isModified}
                            >
                                View Story Sample
                            </Button>
                            <div style={{ minWidth: 200 }}>
                                <SampleFormatSelect sampleFormat={sampleFormat} setSampleFormat={setSampleFormat} />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <ElementsDrawer
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                    elements={elements}
                    setElements={setElements}
                />
            </form>
            <Dialog
                open={sampleDialogOpen}
                onClose={() => { if (!isStreaming) { setSampleDialogOpen(false); setSample("") } }}
                fullWidth={true}
                sx={{ '& .MuiDialog-paper': { minHeight: '80vh', maxHeight: '80vh' } }}
            >
                <DialogTitle>Story Sample</DialogTitle>
                <DialogContent>
                    <Typography>
                        {sample.split('\n').map((paragraph, i) =>
                            <React.Fragment key={i}>
                                {paragraph}
                                <br />
                            </React.Fragment>
                        )}
                    </Typography>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default PlotForm;
