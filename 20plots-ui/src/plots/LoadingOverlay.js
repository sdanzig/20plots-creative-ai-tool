import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import './LoadingOverlay.css';

const LoadingOverlay = ({ open }) => (
    <Backdrop className="loading-backdrop" open={open}>
        <CircularProgress color="inherit" />
    </Backdrop>
);

export default LoadingOverlay;
