import React, { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';

const DelayedTooltip = ({ children, title, delay = 1000, disappearDelay = 3000 }) => {
  const [open, setOpen] = useState(false);
  const [timerShow, setTimerShow] = useState(null);
  const [timerHide, setTimerHide] = useState(null);

  const handleTooltipClose = () => {
    clearTimeout(timerShow);
    clearTimeout(timerHide);
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setTimerShow(setTimeout(() => {
      setOpen(true);
      setTimerHide(setTimeout(() => {
        setOpen(false);
      }, disappearDelay));
    }, delay));
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerShow);
      clearTimeout(timerHide);
    };
  });

  return (
    <Tooltip
      PopperProps={{
        disablePortal: true,
      }}
      onClose={handleTooltipClose}
      open={open}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      title={title}
    >
      <div onMouseOver={handleTooltipOpen} onMouseLeave={handleTooltipClose}>
        {children}
      </div>
    </Tooltip>
  );
};

export default DelayedTooltip;
