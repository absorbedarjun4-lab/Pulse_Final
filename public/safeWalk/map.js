/* ═══════════════════════════════════════════════════════
   PULSE – Real Map Module
   Nominatim Geocoding · OSRM Routing · Browser GPS
   ═══════════════════════════════════════════════════════ */

let map;
let userMarker;
let destMarker;
let routeLine;
let simulationInterval;
let isWalking = false;

// GPS tracking
let watchId = null;
let lastPosition = null;
let idleTimer = null;
let idleStartTime = null;
const IDLE_THRESHOLD_MS = 30 * 1000;        // 30 seconds (demo) — change to 5*60*1000 for production
const SOS_COUNTDOWN_SEC = 30;

// Default: Chennai center
let currentPos = [13.0827, 80.2707];
let path = [];
let pathIndex = 0;

/* ── Initialize Map ── */
function initMap() {
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(currentPos, 13);

  // Dark CartoDB tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  // User marker (champagne pulsing dot)
  userMarker = L.marker(currentPos, {
    icon: L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="width:14px;height:14px;background:#f7d794;border-radius:50%;border:2px solid #fff;box-shadow:0 0 15px rgba(247,215,148,0.8)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })
  }).addTo(map);

  // Try to get real GPS position
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentPos = [pos.coords.latitude, pos.coords.longitude];
        userMarker.setLatLng(currentPos);
        map.flyTo(currentPos, 14, { duration: 1.5 });
      },
      () => { console.log('GPS denied – using Chennai default'); },
      { enableHighAccuracy: true }
    );
  }

  // Click map to set destination
  map.on('click', (e) => {
    setDestinationCoords(e.latlng.lat, e.latlng.lng);
    reverseGeocode(e.latlng.lat, e.latlng.lng);
  });
}

/* ── Reverse Geocode (coords → name) ── */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
    const data = await res.json();
    const name = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    // Show short version
    const short = name.split(',').slice(0, 3).join(',');
    document.getElementById('dest-input').value = short;
  } catch {
    document.getElementById('dest-input').value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/* ── Search Location (Nominatim) ── */
async function searchLocation(query) {
  if (!query || query.length < 2) return;

  const sugBox = document.getElementById('search-suggestions');
  if (sugBox) sugBox.innerHTML = '<div class="p-3 text-pearl/30 text-xs mono">Searching...</div>';

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
    );
    const results = await res.json();

    if (sugBox && results.length > 0) {
      sugBox.innerHTML = '';
      sugBox.classList.remove('hidden');
      results.forEach(r => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item';
        item.innerHTML = `
          <div class="font-medium text-sm text-pearl/80">${r.display_name.split(',').slice(0, 2).join(',')}</div>
          <div class="text-[10px] text-pearl/30 mono mt-0.5">${r.display_name.split(',').slice(2, 5).join(',')}</div>
        `;
        item.addEventListener('click', () => {
          const lat = parseFloat(r.lat);
          const lon = parseFloat(r.lon);
          document.getElementById('dest-input').value = r.display_name.split(',').slice(0, 3).join(',');
          sugBox.classList.add('hidden');
          map.flyTo([lat, lon], 15, { duration: 1.5 });
          setDestinationCoords(lat, lon);
        });
        sugBox.appendChild(item);
      });
    } else if (sugBox) {
      sugBox.innerHTML = '<div class="p-3 text-pearl/30 text-xs mono">No results found</div>';
    }
  } catch (err) {
    console.error('Search error:', err);
  }
}

/* ── Set Destination & Fetch Route ── */
function setDestinationCoords(lat, lng) {
  if (destMarker) map.removeLayer(destMarker);

  destMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'dest-icon',
      html: `<div style="width:14px;height:14px;background:#eda6a3;border-radius:50%;border:2px solid #fff;box-shadow:0 0 15px rgba(237,166,163,0.8)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })
  }).addTo(map);

  // Fit both markers in view
  const bounds = L.latLngBounds([currentPos, [lat, lng]]);
  map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });

  // Fetch real route via OSRM
  fetchRoute(currentPos, [lat, lng]);
}

/* ── OSRM Routing ── */
async function fetchRoute(start, end) {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];

      // Remove old route
      if (routeLine) map.removeLayer(routeLine);

      // Draw route
      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      routeLine = L.polyline(coords, {
        color: '#f7d794',
        weight: 3,
        opacity: 0.6,
        dashArray: '8, 8'
      }).addTo(map);

      // Build path for simulation
      path = coords;
      pathIndex = 0;

      // Update stats with real data
      const distKm = (route.distance / 1000).toFixed(1);
      const etaMin = Math.ceil(route.duration / 60);

      document.getElementById('eta-display').innerText = `${etaMin} min`;
      document.getElementById('dist-display').innerHTML = `${distKm} <span class="text-lg text-pearl/40">km</span>`;
    }
  } catch (err) {
    console.error('Routing error:', err);
    // Fallback: straight line
    if (routeLine) map.removeLayer(routeLine);
    path = [start, end];
    routeLine = L.polyline(path, {
      color: '#f7d794', weight: 2, opacity: 0.4, dashArray: '6, 6'
    }).addTo(map);
  }
}

/* ── Start Walk (GPS tracking + Idle Detection) ── */
function startSimulation() {
  if (isWalking) return;
  isWalking = true;

  // Store the original route stats
  const etaEl = document.getElementById('eta-display');
  const distEl = document.getElementById('dist-display');
  window._origEta = parseInt(etaEl?.innerText) || 10;
  window._origDist = parseFloat(distEl?.innerText) || 1.0;
  window._destCoords = path.length > 0 ? path[path.length - 1] : null;

  // Start idle detection timer (checks every 5 seconds if position changed)
  startIdleDetection();

  // Start real GPS tracking if available
  if (navigator.geolocation) {
    try { startRealTimeGPS(); } catch (e) { console.log('GPS init error:', e); }
  }
}

/* ── Real-Time GPS Tracking ── */
function startRealTimeGPS() {
  lastPosition = null;
  idleStartTime = null;

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const newPos = [pos.coords.latitude, pos.coords.longitude];
      const accuracy = pos.coords.accuracy; // meters

      // Move marker to real position
      userMarker.setLatLng(newPos);
      currentPos = newPos;

      // Smooth pan to follow user
      map.panTo(newPos, { animate: true, duration: 0.8 });

      // Update accuracy circle
      updateAccuracyCircle(newPos, accuracy);

      // Update distance remaining and ETA
      if (window._destCoords) {
        const distToDest = getDistance(newPos, window._destCoords);
        const distKm = (distToDest / 1000).toFixed(1);
        const walkSpeedMps = 1.4; // avg walking speed ~5 km/h
        const etaMin = Math.ceil(distToDest / walkSpeedMps / 60);

        document.getElementById('dist-display').innerHTML =
          `${distKm} <span class="text-lg text-pearl/40">km</span>`;
        document.getElementById('eta-display').innerText = `${etaMin} min`;

        // Check if arrived (within 30 meters of destination)
        if (distToDest < 30) {
          stopSimulation();
          showArrival();
          return;
        }
      }

      // Idle detection
      if (lastPosition) {
        const moved = getDistance(lastPosition, newPos);
        if (moved < 5) {
          // Hasn't moved more than 5 meters
          if (!idleStartTime) {
            idleStartTime = Date.now();
            showIdleToast();
          } else if (Date.now() - idleStartTime >= IDLE_THRESHOLD_MS) {
            triggerIdleWarning();
            idleStartTime = null;
          }
        } else {
          // User moved — reset idle
          idleStartTime = null;
          hideIdleToast();
        }
      }
      lastPosition = newPos;
    },
    (err) => {
      console.log('GPS watch error, falling back to simulation:', err.message);
      startFallbackSimulation();
    },
    {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 10000
    }
  );
}

/* ── Accuracy Circle (shows GPS precision) ── */
let accuracyCircle = null;
function updateAccuracyCircle(pos, accuracy) {
  if (accuracy > 200) return; // Don't show if too inaccurate
  if (accuracyCircle) map.removeLayer(accuracyCircle);
  accuracyCircle = L.circle(pos, {
    radius: accuracy,
    color: '#f7d794',
    fillColor: '#f7d794',
    fillOpacity: 0.06,
    weight: 1,
    opacity: 0.2
  }).addTo(map);
}

/* ── Stop Walk ── */
function stopSimulation() {
  isWalking = false;
  stopGPSWatch();
  stopIdleDetection();
  if (accuracyCircle) { map.removeLayer(accuracyCircle); accuracyCircle = null; }
}


function stopGPSWatch() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

/* ── Haversine Distance (meters) ── */
function getDistance(p1, p2) {
  const R = 6371000;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ══════════════════════════════════════════════════════
   IDLE DETECTION + AUTO-SOS (Simple Counter System)
   ══════════════════════════════════════════════════════ */

let idleCheckInterval = null;
let idleCheckLastPos = null;
let idleElapsedSec = 0;
let sosActive = false;
let sosCountdownInterval = null;
let sosCountdownRemaining = SOS_COUNTDOWN_SEC;

function startIdleDetection() {
  idleElapsedSec = 0;
  sosActive = false;
  idleCheckLastPos = [...currentPos];

  idleCheckInterval = setInterval(() => {
    if (!isWalking || sosActive) return;

    // Check if position changed since last check
    const dist = getDistance(idleCheckLastPos, currentPos);

    if (dist < 10) {
      // Still in same spot
      idleElapsedSec += 5;

      // Show warning toast after 5 seconds
      if (idleElapsedSec === 5) {
        showIdleToast();
      }

      // Trigger SOS after threshold
      if (idleElapsedSec >= (IDLE_THRESHOLD_MS / 1000)) {
        sosActive = true;
        hideIdleToast();
        triggerSOSOverlay();
      }
    } else {
      // User moved — reset counter
      idleElapsedSec = 0;
      hideIdleToast();
    }

    idleCheckLastPos = [...currentPos];
  }, 5000);
}

function stopIdleDetection() {
  if (idleCheckInterval) clearInterval(idleCheckInterval);
  idleCheckInterval = null;
  idleElapsedSec = 0;
  sosActive = false;
  hideIdleToast();
}

/* ── Warning Toast ── */
function showIdleToast() {
  const toast = document.getElementById('alert-toast');
  if (!toast) return;
  gsap.to(toast, { y: 20, opacity: 1, duration: 0.4, ease: "power2.out" });
}

function hideIdleToast() {
  const toast = document.getElementById('alert-toast');
  if (!toast) return;
  gsap.to(toast, { y: -20, opacity: 0, duration: 0.4, ease: "power2.in" });
}

/* ── Full-Page Red SOS Overlay ── */
function triggerSOSOverlay() {
  const modal = document.getElementById('sos-countdown-modal');
  if (!modal) return;

  sosCountdownRemaining = SOS_COUNTDOWN_SEC;
  modal.classList.remove('hidden');
  modal.classList.remove('pointer-events-none');
  modal.style.opacity = '0';
  gsap.to(modal, { opacity: 1, duration: 0.3 });

  updateCountdownDisplay();

  sosCountdownInterval = setInterval(() => {
    sosCountdownRemaining--;
    updateCountdownDisplay();

    if (sosCountdownRemaining <= 0) {
      clearInterval(sosCountdownInterval);
      autoSendSOS();
    }
  }, 1000);
}

function updateCountdownDisplay() {
  const el = document.getElementById('sos-countdown-timer');
  if (el) el.innerText = sosCountdownRemaining;

  const textEl = document.getElementById('sos-countdown-text');
  if (textEl) textEl.innerText = sosCountdownRemaining;

  const circle = document.getElementById('countdown-circle');
  if (circle) {
    const pct = sosCountdownRemaining / SOS_COUNTDOWN_SEC;
    const circumference = 2 * Math.PI * 54;
    circle.style.strokeDashoffset = circumference * (1 - pct);
  }
}

function cancelSOS() {
  clearInterval(sosCountdownInterval);

  const modal = document.getElementById('sos-countdown-modal');
  if (modal) {
    gsap.to(modal, {
      opacity: 0, duration: 0.3,
      onComplete: () => {
        modal.classList.add('hidden');
        modal.classList.add('pointer-events-none');
      }
    });
  }

  // Reset — counter goes back to 0, sosActive=false so the interval picks it up again
  sosActive = false;
  idleElapsedSec = 0;
}

function autoSendSOS() {
  clearInterval(sosCountdownInterval);

  const modal = document.getElementById('sos-countdown-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.add('pointer-events-none');
    modal.style.opacity = '0';
  }

  const emergencyModal = document.getElementById('modal-overlay');
  if (emergencyModal) {
    emergencyModal.classList.remove('pointer-events-none');
    gsap.to(emergencyModal, { opacity: 1, duration: 0.3 });
  }

  const modalTitle = emergencyModal?.querySelector('h2');
  if (modalTitle) modalTitle.innerText = 'SOS Auto-Triggered';

  console.log(`🚨 AUTO-SOS TRIGGERED at ${new Date().toLocaleTimeString()}`);
  console.log(`📍 Location: ${currentPos[0].toFixed(6)}, ${currentPos[1].toFixed(6)}`);

  // Broadcast to Command Center (Identify logged-in user if available)
  const userData = JSON.parse(localStorage.getItem('pulse_user')) || {};
  const token = localStorage.getItem('crisis_token');
  const identifier = userData.name || 'GUEST';
  const userId = userData.id || 'GUEST';

  fetch('/api/sos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: userId,
      latitude: currentPos[0],
      longitude: currentPos[1],
      emergencyType: `SafeWalk Emergency (${identifier === 'GUEST' ? 'Guest' : 'User: ' + identifier})`
    })
  }).then(res => {
    if (res.ok) console.log('[SOS] Broadcast complete as:', identifier);
    else console.error('[SOS] Broadcast failed');
  }).catch(err => console.error('[SOS] Network error:', err));

  // Allow re-trigger after emergency modal is closed
  sosActive = false;
  idleElapsedSec = 0;
}

/* ── Arrival ── */
function showArrival() {
  document.getElementById('status-text').innerText = 'Arrived';
}

/* ── Global API ── */
window.mapModule = {
  initMap,
  startSimulation,
  stopSimulation,
  searchLocation,
  cancelSOS,
  autoSendSOS
};
