/* ═══════════════════════════════════════════════════════
   PULSE – UI Module
   Controls, Search, Particles, Carousel
   ═══════════════════════════════════════════════════════ */

let timerInterval;
let seconds = 0;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusText = document.getElementById('status-text');
const statusBar = document.getElementById('status-bar');
const sosBtn = document.getElementById('sos-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const alertToast = document.getElementById('alert-toast');
const destInput = document.getElementById('dest-input');

function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rs = s % 60;
    return [h, m, rs].map(v => v < 10 ? '0' + v : v).join(':');
}

function startTimer() {
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('walk-timer').innerText = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

/* ── Start / Stop Walk ── */
startBtn.addEventListener('click', () => {
    window.mapModule.startSimulation();
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    statusText.innerText = 'Active';

    gsap.to(statusBar, { y: 0, opacity: 1, duration: 0.6, ease: "power4.out" });
    startTimer();
});

stopBtn.addEventListener('click', () => {
    window.mapModule.stopSimulation();
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    statusText.innerText = 'Inactive';

    gsap.to(statusBar, { y: -60, opacity: 0, duration: 0.6, ease: "power4.in" });
    stopTimer();
});

/* ── Live Search with Debounce ── */
let searchTimeout = null;

if (destInput) {
    destInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);

        if (query.length < 2) {
            const sugBox = document.getElementById('search-suggestions');
            if (sugBox) sugBox.classList.add('hidden');
            return;
        }

        // Debounce: wait 400ms after user stops typing
        searchTimeout = setTimeout(() => {
            window.mapModule.searchLocation(query);
        }, 400);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!destInput.contains(e.target)) {
            const sugBox = document.getElementById('search-suggestions');
            if (sugBox) sugBox.classList.add('hidden');
        }
    });
}

/* ── SOS Button ── */
sosBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('pointer-events-none');
    gsap.to(modalOverlay, { opacity: 1, duration: 0.3 });
});

closeModal.addEventListener('click', () => {
    gsap.to(modalOverlay, {
        opacity: 0, duration: 0.3,
        onComplete: () => modalOverlay.classList.add('pointer-events-none')
    });
});


/* ── Particle Canvas System ── */
function initBackgroundParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const PARTICLE_COUNT = 40;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Particle {
        constructor() { this.reset(true); }
        reset(init) {
            this.x = Math.random() * w;
            this.y = init ? Math.random() * h : h + 10;
            this.size = Math.random() * 1 + 0.2;
            this.speedY = -(Math.random() * 0.3 + 0.08);
            this.opacity = Math.random() * 0.2 + 0.03;
        }
        update() {
            this.y += this.speedY;
            if (this.y < -10) this.reset(false);
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(252, 251, 251, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) { p.update(); p.draw(); }
        requestAnimationFrame(animate);
    }
    animate();
}

/* ── Horizontal Scroll Carousel ── */
function initHorizontalScroll() {
    const carouselSection = document.querySelector('.carousel-section');
    const track = document.getElementById('carousel-track');
    if (!carouselSection || !track) return;

    window.addEventListener('scroll', () => {
        const rect = carouselSection.getBoundingClientRect();
        const sectionHeight = carouselSection.offsetHeight;
        const viewportH = window.innerHeight;

        const scrolled = -rect.top;
        const scrollDistance = sectionHeight - viewportH;
        let progress = scrolled / scrollDistance;
        progress = Math.max(0, Math.min(1, progress));

        const trackWidth = track.scrollWidth;
        const viewportW = window.innerWidth;
        const maxTranslate = trackWidth - (viewportW * 0.82);

        track.style.transform = `translateX(-${progress * maxTranslate}px)`;
    }, { passive: true });
}

/* ── Initialize ── */
document.addEventListener('DOMContentLoaded', () => {
    initBackgroundParticles();
    initHorizontalScroll();
});

window.uiModule = {};
