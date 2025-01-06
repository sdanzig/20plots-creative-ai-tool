import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlotForm from './plots/PlotForm';
import PlotList from './plots/PlotList';

const PlotPage = ({ setGenerating }) => {
    const [plots, setPlots] = useState([]);
    const [plotsChanged, setPlotChanged] = useState(false);
    const [editingPlot, onEditingPlotChanged] = useState(null);
    const [isModified, setIsModified] = useState(false); // Used to determine if the user has made changes to the plot form
  

    const startEditingPlot = (plot) => {
        onEditingPlotChanged(plot);
    };

    const startGenerating = () => {
        setGenerating(true);
        localStorage.setItem("isGenerating", "true");
    };

    const fetchPlots = async () => {
        const serverUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await axios.get(`${serverUrl}/api/plots`);
            setPlots(response.data.slice(0, 20)); // Only fetch the first 20 plots
        } catch (error) {
            console.error('Error fetching plots:', error);
        }
    };

    useEffect(() => {
        const token = window.localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchPlots();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (plotsChanged) {
            fetchPlots();
            setPlotChanged(false);
        }
    }, [plotsChanged]);

    return (
        <>
            <PlotForm
                onPlotsChanged={setPlotChanged}
                onEditingPlotChanged={onEditingPlotChanged}
                plot={editingPlot}
                plotCount={plots.length}
                startGenerating={startGenerating}
                isModified={isModified}
                setIsModified={setIsModified}
            />
            <PlotList
                plotsChanged={plotsChanged}
                onEditStart={startEditingPlot}
                plots={plots}
                setPlots={setPlots}
                setPlotChanged={setPlotChanged}
                editingPlot={editingPlot}
                setIsModified={setIsModified}
            />
        </>
    );
};

export default PlotPage;
