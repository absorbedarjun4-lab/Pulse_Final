/* ═══════════════════════════════════════════════════
   Pulse — Resource Details Panel Module
   ═══════════════════════════════════════════════════ */

const DetailModule = (() => {
    const panel = () => document.getElementById('detail-panel');
    const content = () => document.getElementById('detail-content');
    let currentResource = null;

    function init() {
        document.getElementById('detail-close').addEventListener('click', close);
    }

    function open(resource) {
        currentResource = resource;
        const meta = CATEGORIES.find(c => c.id === resource.category) || { label: 'Resource', icon: '📍' };
        const statusClass = resource.isOpen ? 'open' : 'closed';
        const statusText = resource.isOpen ? 'Open' : 'Closed';
        const statusDot = resource.isOpen
            ? '<span style="width:6px;height:6px;border-radius:50%;background:#4ADE80;display:inline-block;"></span>'
            : '<span style="width:6px;height:6px;border-radius:50%;background:#EDA6A3;display:inline-block;"></span>';

        content().innerHTML = `
      <div style="margin-bottom:20px;">
        <span style="font-size:32px; display:block; margin-bottom:12px;">${meta.icon}</span>
        <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:rgba(252,251,251,0.4); margin-bottom:6px;">${meta.label}</p>
        <h3 style="font-size:20px; font-weight:600; line-height:1.3; margin-bottom:8px;">${resource.name}</h3>
        <span class="detail-status ${statusClass}">${statusDot} ${statusText}</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
        <div style="display:flex; align-items:flex-start; gap:10px;">
          <span style="color:rgba(252,251,251,0.3); margin-top:2px;">📍</span>
          <div>
            <p style="font-size:13px; color:rgba(252,251,251,0.75);">${resource.address}</p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <span style="color:rgba(252,251,251,0.3);">📏</span>
          <p style="font-size:13px; color:rgba(252,251,251,0.75);">${resource.distance} km away</p>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <span style="color:rgba(252,251,251,0.3);">📋</span>
          <p style="font-size:13px; color:rgba(252,251,251,0.75);">${resource.availability}</p>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <span style="color:rgba(252,251,251,0.3);">📞</span>
          <p style="font-size:13px; color:rgba(252,251,251,0.75);">${resource.phone}</p>
        </div>
      </div>

      <div style="display:flex; gap:10px;">
        <button class="btn-champagne" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}', '_blank')">
          <span>🧭</span> Navigate
        </button>
        <button class="btn-outline" onclick="window.open('tel:${resource.phone}')">
          <span>📞</span> Call
        </button>
      </div>
    `;

        const p = panel();
        p.classList.remove('hidden');
        // Force reflow for transition
        void p.offsetWidth;
        p.classList.add('visible');
    }

    function close() {
        const p = panel();
        p.classList.remove('visible');
        setTimeout(() => p.classList.add('hidden'), 450);
        currentResource = null;
        MapModule.clearSelection();
    }

    function isOpen() {
        return currentResource !== null;
    }

    return { init, open, close, isOpen };
})();
