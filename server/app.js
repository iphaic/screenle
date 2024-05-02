const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

// Ensure CSV file is being read from the right location
app.get('/api/movies', (req, res) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, '..', 'data', 'imdb_top_films.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);  // Make sure this sends back an array
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});