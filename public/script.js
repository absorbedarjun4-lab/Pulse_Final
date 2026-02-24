/* ═══════════════════════════════════════════════════
   SOS Landing Page — Orchestrator
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  /* ── DOM Refs ────────────────────────────────────── */
  const sosBtn = document.getElementById('sos-btn');
  const sosWrapper = document.getElementById('sos-wrapper');
  const btnGetStarted = document.getElementById('btn-get-started');
  const waveCanvas = document.getElementById('wave-canvas');
  const rippleCanvas = document.getElementById('ripple-canvas');
  const boatEl = document.getElementById('boat');

  // Generic Modal
  const infoModal = document.getElementById('info-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  /* ── Init Modules ───────────────────────────────── */
  Waves.init(waveCanvas);
  Ripples.init(rippleCanvas);
  Boat.init(boatEl, sosWrapper, sosBtn);

  /* ── Modal helpers ──────────────────────────────── */
  function openModal(template) {
    modalContent.innerHTML = '';
    const clone = template.content.cloneNode(true);
    modalContent.appendChild(clone);

    infoModal.classList.add('is-open');
    infoModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    infoModal.classList.remove('is-open');
    infoModal.setAttribute('aria-hidden', 'true');
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ── SOS Live Tracking & System ─────────────────── */
  let socket;
  let guestCoords = null;

  function initGuestTracking() {
    if (socket) return;
    socket = io();

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(pos => {
        guestCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        socket.emit('UPDATE_LOCATION', {
          userId: 'GUEST',
          latitude: guestCoords.lat,
          longitude: guestCoords.lng
        });
      }, err => console.warn('Guest tracking disabled'), { enableHighAccuracy: true });
    }
  }

  // Start tracking as soon as they interact or after a delay
  setTimeout(initGuestTracking, 2000);

  /* ── SOS Button ─────────────────────────────────── */
  sosBtn.addEventListener('click', async () => {
    sosBtn.classList.add('sos-btn--ripple');

    const rect = sosBtn.getBoundingClientRect();
    Ripples.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2);

    console.log('[SOS] Guest Alert triggered');

    const overlay = document.getElementById('sosLoadingOverlay');
    const liquid = document.getElementById('sosLiquid');
    const check = document.getElementById('sosSuccessCheck');
    const statusText = document.getElementById('sosStatusText');

    overlay.classList.add('active');
    liquid.style.height = '50%';

    async function broadcastSOS(latitude, longitude) {
      try {
        const res = await fetch('/api/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'GUEST',
            latitude,
            longitude,
            emergencyType: 'General Emergency (Guest)'
          })
        });

        if (res.ok) {
          liquid.style.height = '85%';
          statusText.innerText = "SIGNAL BROADCASTED";

          setTimeout(() => {
            liquid.style.height = '100%';
            check.classList.add('visible');
            statusText.innerText = "COMMAND REACHED";
            setTimeout(() => { window.location.href = '/sos'; }, 800);
          }, 600);
        } else {
          const data = await res.json().catch(() => ({}));
          overlay.classList.remove('active');
          alert(data.message || "Broadcast failed. Please try again.");
        }
      } catch (err) {
        console.error("SOS Error:", err);
        overlay.classList.remove('active');
        alert("Network error. Please check your connection and try again.");
      }
    }

    // Use already-cached coords if available — skip GPS wait
    if (guestCoords) {
      await broadcastSOS(guestCoords.lat, guestCoords.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          guestCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          await broadcastSOS(guestCoords.lat, guestCoords.lng);
        },
        () => {
          overlay.classList.remove('active');
          alert("Location access required for satellite uplink. Please enable GPS.");
        }
      );
    } else {
      overlay.classList.remove('active');
      alert("Geolocation is not supported by your browser.");
    }
  });

  if (btnGetStarted) {
    btnGetStarted.addEventListener('click', (e) => {
      // Small boat animation before redirect (optional flair)
      if (Boat.isAnimating()) return;
      Boat.navigateTo(btnGetStarted, () => {
        window.location.href = '/auth';
      });
    });
  }
});
