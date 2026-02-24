/* ── Minimalistic Dot & Ring Cursor Logic ─────────────────────────────────── */

(function () {
    const cursor = document.createElement('div');
    cursor.className = 'minimal-cursor';

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';

    cursor.appendChild(dot);
    cursor.appendChild(ring);
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Spawn trail particles
        if (Math.random() > 0.6) {
            spawnTrail(mouseX, mouseY);
        }
    });

    function spawnTrail(x, y) {
        const p = document.createElement('div');
        p.className = 'trail-particle';

        // Slight random offset
        const offX = (Math.random() - 0.5) * 8;
        const offY = (Math.random() - 0.5) * 8;

        p.style.left = `${x + offX}px`;
        p.style.top = `${y + offY}px`;

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }

    // Hover detection
    const interactiveElements = 'a, button, input, .nav-link, .btn';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveElements)) {
            document.body.classList.add('is-hovering');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveElements)) {
            document.body.classList.remove('is-hovering');
        }
    });

    function animate() {
        // Dot follows instantly
        cursor.style.left = `${mouseX - 10}px`;
        cursor.style.top = `${mouseY - 10}px`;

        // Smoother trail or delayed follow for more interest (optional)
        // Here we just keep it centered for the minimalistic feel

        requestAnimationFrame(animate);
    }

    animate();
})();
