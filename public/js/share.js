// share.js
function showVictoryModal() {
    let guessCount = parseInt(getCookie('guesses'));
    guessCount = Math.max(0, guessCount - 1); // Ensure it doesn't go below 0
    document.getElementById('guessCountDisplay').textContent = `${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`;
    updateShareLinks(guessCount);
    document.getElementById('victoryContainer').style.display = 'block';
}

function updateShareLinks(guessCount) {
    const message = `I beat today's screenle in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}! Can you beat my score?`;
    document.getElementById('shareOnTwitter').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(document.location.href)}`;
    document.getElementById('shareOnFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(document.location.href)}&quote=${encodeURIComponent(message)}`;
}

function handleGenericShare() {
    let guessCount = parseInt(getCookie('guesses'));
    guessCount = Math.max(0, guessCount - 1);
    const guessText = guessCount === 1 ? 'guess' : 'guesses';
    const message = `I beat today's screenle in ${guessCount} ${guessText}! Try to beat my score: ${document.location.href}`;

    // Retrieve the button element for later use
    const shareButton = document.getElementById('genericShareButton');

    // Check if the device is mobile using User-Agent Client Hints API
    const isMobile = navigator.userAgentData && navigator.userAgentData.mobile;

    if (isMobile && navigator.share) {
        navigator.share({
            title: 'play screenle',
            text: message,
            url: document.location.href
        }).then(() => {
            shareButton.textContent = 'Copied!';
            setTimeout(() => {
                shareButton.innerHTML = '<img src="images/copy.png" alt="Copy Link">';
            }, 2000);
        }).catch(console.error);
    } else {
        // Copy the message to the clipboard for non-mobile devices
        navigator.clipboard.writeText(message).then(() => {
            shareButton.textContent = 'Copied!';
            setTimeout(() => {
                shareButton.innerHTML = '<img src="images/copy.png" alt="Copy Link">';
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            shareButton.textContent = 'Failed to copy!';
            setTimeout(() => {
                shareButton.innerHTML = '<img src="images/copy.png" alt="Copy Link">';
            }, 1000);
        });
    }
}

function share_custom_game() {
    const movieTitle = document.getElementById('guessInput').value.trim();
    if (!movieTitle) {
        alert("Please enter a movie title.");
        return;
    }

    const movie = movies.find(m => m['Movie Title'].toLowerCase() === movieTitle.toLowerCase());
    if (!movie) {
        document.getElementById('gameMessage').textContent = "Movie not found, try again.";
        return;
    }

    const encodedTitle = encodeMovieTitle(movie['Movie Title']);
    const customLink = generateCustomGameLink(encodedTitle);
    const message = `Try to guess the movie: ${customLink}`;
    shareLink(message);
}

function shareLink(message) {
    // Check if the device is mobile using User-Agent Client Hints API
    const isMobile = navigator.userAgentData && navigator.userAgentData.mobile;

    if (isMobile && navigator.share) {
        navigator.share({
            title: 'Play screenle - Custom Game',
            text: message,
            url: message  // Here we share the URL itself as the text in mobile sharing
        }).then(() => console.log('Share was successful.'))
          .catch(console.error);
    } else {
        // For non-mobile devices, we mimic clipboard copying behavior
        navigator.clipboard.writeText(message).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link to clipboard: ', err);
            alert('Failed to copy link to clipboard.');
        });
    }
}