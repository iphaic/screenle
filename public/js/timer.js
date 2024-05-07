document.addEventListener('DOMContentLoaded', function() {
    const timeLeftDisplay = document.getElementById('timeLeft');

    // fetches the last reset time from the server
    async function fetchLastResetTime() {
        try {
            const response = await fetch('/api/last-reset-time');
            if (response.ok) {
                const data = await response.json();
                return new Date(data.lastReset);
            }
            throw new Error('Failed to fetch reset time');
        } catch (error) {
            console.error('Error fetching last reset time:', error);
            return null;
        }
    }

    function updateTimer() {
        fetchLastResetTime().then(lastReset => {
            if (!lastReset) return;

            const now = new Date();
            const nextReset = new Date(lastReset);
            nextReset.setDate(nextReset.getDate() + 1);

            const timeDifference = nextReset - now;

            if (timeDifference <= 0) {
                timeLeftDisplay.textContent = 'Resetting...';
                return;
            }

            const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            timeLeftDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`;
        });
    }

    setInterval(updateTimer, 1000);
});
