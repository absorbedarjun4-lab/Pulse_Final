/* ═══════════════════════════════════════════════════
   Pulse — Map Module (Leaflet)
   ═══════════════════════════════════════════════════ */

const MapModule = (() => {
    let map;
    let markersLayer;
    let userMarker;
    let selectedMarkerId = null;
    let markerRefs = {};

    function init() {
        map = L.map('map', {
            center: [USER_LOCATION.lat, USER_LOCATION.lng],
            zoom: 13,
            zoomControl: true,
            attributionControl: false,
            zoomAnimation: true,
            fadeAnimation: true,
        });

        // Dark tiles — CartoDB Dark Matter
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
        }).addTo(map);

        // User location marker
        const userIcon = L.divIcon({
            className: '',
            html: '<div class="user-marker"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
        });
        userMarker = L.marker([USER_LOCATION.lat, USER_LOCATION.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);

        // Smooth zoom-in on load
        setTimeout(() => {
            map.flyTo([USER_LOCATION.lat, USER_LOCATION.lng], 14, { duration: 1.8, easeLinearity: 0.4 });
        }, 600);
    }

    function getCategoryMeta(catId) {
        return CATEGORIES.find(c => c.id === catId) || { icon: '📍', color: '#FCFBFB' };
    }

    function renderMarkers(resources, onMarkerClick) {
        markersLayer.clearLayers();
        markerRefs = {};

        resources.forEach(r => {
            const meta = getCategoryMeta(r.category);
            const isSelected = selectedMarkerId === r.id;

            const markerHtml = `<div class="custom-marker ${isSelected ? 'selected' : ''}" data-id="${r.id}">${meta.icon}</div>`;

            const icon = L.divIcon({
                className: '',
                html: markerHtml,
                iconSize: [38, 38],
                iconAnchor: [19, 19],
            });

            const marker = L.marker([r.lat, r.lng], { icon }).addTo(markersLayer);

            // Popup on hover
            marker.bindPopup(
                `<div style="padding:10px 14px; min-width:160px;">
          <p style="font-size:13px; font-weight:600; margin-bottom:3px;">${r.name}</p>
          <p style="font-size:11px; opacity:0.6;">${meta.label} · ${r.distance} km</p>
        </div>`,
                { closeButton: false, offset: [0, -10] }
            );

            marker.on('mouseover', function () { this.openPopup(); });
            marker.on('mouseout', function () { this.closePopup(); });
            marker.on('click', () => {
                selectMarker(r.id);
                onMarkerClick(r);
            });

            markerRefs[r.id] = marker;
        });
    }

    function selectMarker(id) {
        selectedMarkerId = id;
        // Update all markers visual state
        document.querySelectorAll('.custom-marker').forEach(el => {
            el.classList.remove('selected');
            if (parseInt(el.dataset.id) === id) {
                el.classList.add('selected');
            }
        });
    }

    function clearSelection() {
        selectedMarkerId = null;
        document.querySelectorAll('.custom-marker').forEach(el => el.classList.remove('selected'));
    }

    function panTo(lat, lng) {
        map.flyTo([lat, lng], 15, { duration: 1.2 });
    }

    return { init, renderMarkers, selectMarker, clearSelection, panTo };
})();
