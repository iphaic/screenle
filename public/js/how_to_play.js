document.addEventListener('DOMContentLoaded', function () {
    const howToPlayButton = document.getElementById('howToPlayButton');
    const howToPlayContainer = document.getElementById('howToPlayContainer');
    const closeHowToPlay = document.getElementById('closeHowToPlay');

    // Toggle the visibility of the How to Play container
    howToPlayButton.addEventListener('click', function() {
        // Check if container is already visible
        if (howToPlayContainer.style.visibility === 'visible') {
            howToPlayContainer.style.opacity = '0';
            setTimeout(() => {
                howToPlayContainer.style.visibility = 'hidden';
            }, 300); // Transition time, assuming there's CSS for opacity transition
        } else {
            howToPlayContainer.style.visibility = 'visible';
            setTimeout(() => {
                howToPlayContainer.style.opacity = '1';
            }, 10); // Delay the opacity to ensure visibility transition works
        }
    });

    // Hide the How to Play container
    closeHowToPlay.addEventListener('click', function() {
        howToPlayContainer.style.opacity = '0';
        setTimeout(() => {
            howToPlayContainer.style.visibility = 'hidden';
        }, 300); // Sync with CSS transition time if any
    });
});
