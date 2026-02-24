/* loader.js */
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('rescue-loader');
    if (!loader) return;

    const statusText = loader.querySelector('.loader-status');
    const man = loader.querySelector('.man');

    // Check if user has already seen the loader in this session
    if (sessionStorage.getItem('rescue_loader_seen')) {
        loader.classList.add('hidden');
        document.body.style.overflow = "auto";
        return;
    }

    // Sequence timing
    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function startRescue() {
        // 1. Drown for a bit
        await delay(2000);
        statusText.textContent = "SIGHTING CONFIRMED";

        // 2. Drop the rope
        await delay(1000);
        loader.classList.add('rescue-active');
        statusText.textContent = "DEPLOYING EXTRACTION LINE";

        // 3. Man reaches for rope (animation adjustment)
        await delay(1500);
        man.style.animation = "none";
        man.style.transform = "translateY(-10px) scale(1.1)";
        statusText.textContent = "LINK ESTABLISHED";

        // 4. Pull up
        await delay(1000);
        loader.classList.add('pull-up');
        statusText.textContent = "EXFILTRATING...";

        // 5. Hide loader and reveal site
        await delay(2000);
        loader.classList.add('hidden');

        // Enable site interaction
        document.body.style.overflow = "auto";

        // Mark as seen for this session
        sessionStorage.setItem('rescue_loader_seen', 'true');

        // Dispatch event for other scripts if needed
        window.dispatchEvent(new CustomEvent('rescue-complete'));
    }

    // Start the story
    startRescue();
});
