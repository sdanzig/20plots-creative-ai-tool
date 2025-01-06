import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const genres = [
    "Action", "Adventure", "Animation", "Coming-of-Age", "Comedy", "Crime", "Cyberpunk", "Drama", "Dystopian", "Family",
    "Fantasy", "Folk", "Gothic", "Heist", "Historical", "Horror", "Inspirational","Legal", "Magical-Realism", "Medical",
    "Mystery", "Noir", "Paranormal", "Post-Apocalyptic", "Psychological","Romance", "Satire", "Sci-Fi", "Slice-of-Life",
    "Sports", "Spy", "Steampunk", "Superhero", "Supernatural", "Suspense","Time-Travel", "Tragedy", "Urban", "Vampire",
    "War", "Werewolf", "Western", "Wilderness", "Zombie"
];

const GenreSelect = ({ genre, setGenre, setIsModified, plot }) => (
    <TextField
        select
        label="Genre"
        value={genre}
        onChange={(e) => {
            setGenre(e.target.value);
            setIsModified(true);
            if (plot) {
                plot.genre = e.target.value;
            }
        }}
        variant="outlined"
        sx={{ width: 180 }}
    >
        {genres.map((genre, index) => (
            <MenuItem key={index} value={genre}>
                {genre}
            </MenuItem>
        ))}
    </TextField>
);

export default GenreSelect;
