import React from 'react';
import { InputLabel, MenuItem, Select } from '@mui/material';

const sampleFormats = [
    "First-Person Prose",
    "Second-Person Prose",
    "Third-Person Prose",
    "Flash Fiction",
    "Screenplay",
    "Play Script",
    "Correspondence",
    "Online Chat",
    "Diary Entry",
    "Fictional Blog Post",
    "Monologue",
    "Radio Drama Script",
    "Graphic Novel",
    "Fairy Tale",
    "Fable"
];

const SampleFormatSelect = ({ sampleFormat, setSampleFormat }) => (
    <div>
        <InputLabel id="sample-format-label">Sample Format</InputLabel>
        <Select
            sx={{ width: 210 }}
            labelId="sample-format-label"
            value={sampleFormat || ""}
            onChange={(event) => setSampleFormat(event.target.value)}
        >
            {sampleFormats.map((format, index) => (
                <MenuItem value={format} key={index}>{format}</MenuItem>
            ))}
        </Select>
    </div>
);

export default SampleFormatSelect;