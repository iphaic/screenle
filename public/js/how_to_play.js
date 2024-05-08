document.addEventListener('DOMContentLoaded', function () {
    const howToPlayButton = document.getElementById('howToPlayButton');
    const howToPlayContainer = document.getElementById('howToPlayContainer');
    const closeHowToPlay = document.getElementById('closeHowToPlay');

    howToPlayButton.addEventListener('click', function() {
        if (howToPlayContainer.style.visibility === 'visible') {
            howToPlayContainer.style.opacity = '0';
            setTimeout(() => {
                howToPlayContainer.style.visibility = 'hidden';
            }, 300);
        } else {
            howToPlayContainer.style.visibility = 'visible';
            setTimeout(() => {
                howToPlayContainer.style.opacity = '1';
            }, 10);
        }
    });

    closeHowToPlay.addEventListener('click', function() {
        howToPlayContainer.style.opacity = '0';
        setTimeout(() => {
            howToPlayContainer.style.visibility = 'hidden';
        }, 300);
    });
});

function isDecember() {
    const currentDate = new Date();
    return currentDate.getMonth() === 11; // Month is 0-indexed, 11 = December
}

function createSnowflakes() {
    if (!isDecember()) return;

    const container = document.getElementById('snow-container');
    const numberOfSnowflakes = 25; // Adjust number of snowflakes here

    for (let i = 0; i < numberOfSnowflakes; i++) {
        let snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.textContent = '❄'; // Snowflake emoji
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDelay = Math.random() * -20 + 's'; // Random delay for more natural effect
        snowflake.style.fontSize = Math.random() * 20 + 5 + 'px'; // Random size

        container.appendChild(snowflake);
    }
}

document.addEventListener('DOMContentLoaded', createSnowflakes);