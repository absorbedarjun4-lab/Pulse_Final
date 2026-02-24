/* ═══════════════════════════════════════════════════
   Pulse — Quick Stats Module
   ═══════════════════════════════════════════════════ */

const StatsModule = (() => {
    let observer;

    function init() {
        setupObserver();
    }

    function update(filteredResources) {
        const totalNearby = filteredResources.length;
        const activeShelters = filteredResources.filter(r => r.category === 'shelter' && r.isOpen).length;
        const availableBeds = filteredResources.reduce((sum, r) => sum + (r.beds || 0), 0);

        const stats = [
            { label: 'Total Resources Nearby', value: totalNearby, icon: '📊' },
            { label: 'Active Shelters', value: activeShelters, icon: '🏠' },
            { label: 'Available Beds', value: availableBeds, icon: '🛏️' },
        ];

        const container = document.getElementById('stats-container');
        container.innerHTML = '';

        stats.forEach((stat, i) => {
            const card = document.createElement('div');
            card.className = 'stat-card glass-card';
            card.style.animationDelay = `${i * 0.15}s`;
            card.innerHTML = `
        <p style="font-size:28px; margin-bottom:8px;">${stat.icon}</p>
        <p class="stat-value" data-target="${stat.value}" style="font-size:36px; font-weight:700; color:#F7D794; margin-bottom:4px;">0</p>
        <p style="font-size:12px; text-transform:uppercase; letter-spacing:0.1em; color:rgba(252,251,251,0.4); font-weight:500;">${stat.label}</p>
      `;
            container.appendChild(card);
        });

        // Re-observe for animation
        setupObserver();
    }

    function setupObserver() {
        if (observer) observer.disconnect();

        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Count up animation
                    const valEl = entry.target.querySelector('.stat-value');
                    if (valEl) countUp(valEl, parseInt(valEl.dataset.target));
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.stat-card').forEach(card => observer.observe(card));
    }

    function countUp(el, target) {
        const duration = 1200;
        const start = performance.now();
        const from = 0;

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(from + (target - from) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    return { init, update };
})();
