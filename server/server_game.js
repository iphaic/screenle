let movies = [];
let selectedMovie;

function setMovies(data) {
    movies = data;
    console.log('Movies array set in server_game:', movies.length);
}

function selectMovieOfDay() {
    let today = new Date();
    let dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    console.log(`Date: ${today.toISOString()} | Day of Year: ${dayOfYear}`);

    if (movies.length > 0) {
        selectedMovie = movies[dayOfYear % movies.length];
        console.log(`Movie of the day selected: ${selectedMovie['Movie Title'] || 'No title found'} - ${today.toLocaleString()}`);
    } else {
        console.log('No movies to select');
    }
}

module.exports = { selectMovieOfDay, setMovies };