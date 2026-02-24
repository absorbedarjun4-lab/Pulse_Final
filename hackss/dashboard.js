/* ===== PULSE DASHBOARD — JS ===== */

const ALERTS = [
    { type: 'critical', title: 'SOS — Flash Flood Warning', meta: 'Sector 12 · 3 min ago', dist: '1.4 km' },
    { type: 'critical', title: 'SOS — Building Collapse', meta: 'Old Town · 11 min ago', dist: '3.2 km' },
    { type: 'warning', title: 'Wildfire Proximity Alert', meta: 'Ridge Valley · Wind shift', dist: '8.7 km' },
    { type: 'info', title: 'Medical Supply Drop', meta: 'Zone 4 · ETA 45 min', dist: '2.1 km' },
];

function renderAlerts() {
    const $el = document.getElementById('alerts-list');
    $el.innerHTML = ALERTS.map(a => {
        const cls = a.type === 'critical' ? '' : a.type === 'warning' ? ' alert-row--warn' : ' alert-row--info';
        return `<div class="alert-row${cls}">
      <div class="alert-row__dot"></div>
      <div class="alert-row__text">
        <div class="alert-row__title">${a.title}</div>
        <div class="alert-row__meta">${a.meta}</div>
      </div>
      <span class="alert-row__dist">${a.dist}</span>
    </div>`;
    }).join('');
}

function animateProgress() {
    const pct = 62;
    const circ = 2 * Math.PI * 42;
    const offset = circ - (pct / 100) * circ;
    setTimeout(() => {
        document.getElementById('progress-fill').style.strokeDashoffset = offset;
    }, 300);
}

async function checkVerification() {
    try {
        const res = await fetch('/api/results');
        if (!res.ok) return;
        const results = await res.json();
        if (results.length > 0) {
            const latest = results[0];
            const $badge = document.getElementById('verification-badge');
            if (latest.verified === 1) {
                $badge.className = 'id-card__badge id-card__badge--verified';
                $badge.innerHTML = '<span>✅</span> VERIFIED — MISSION READY';
                if (latest.tier) document.getElementById('user-tier').textContent = latest.tier;
            } else {
                $badge.innerHTML = '<span>❌</span> NOT VERIFIED';
            }
            if (latest.percentage) {
                document.getElementById('progress-pct').textContent = latest.percentage + '%';
                const circ = 2 * Math.PI * 42;
                document.getElementById('progress-fill').style.strokeDashoffset = circ - (latest.percentage / 100) * circ;
            }
        }
    } catch (e) {
        console.log('Backend not available — using placeholder data');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderAlerts();
    animateProgress();
    checkVerification();
});
