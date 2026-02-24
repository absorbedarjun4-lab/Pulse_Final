/* ═══════════════════════════════════════════════════
   Pulse — App Controller
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── Init Modules ──
    MapModule.init();
    DetailModule.init();
    StatsModule.init();

    // ── Render cycle ──
    function render() {
        const filtered = FilterModule.applyFilters(RESOURCES);
        MapModule.renderMarkers(filtered, onMarkerClick);
        StatsModule.update(filtered);
    }

    function onMarkerClick(resource) {
        MapModule.selectMarker(resource.id);
        MapModule.panTo(resource.lat, resource.lng);
        DetailModule.open(resource);
    }

    // Init filter with render callback
    FilterModule.init(render);

    // Initial render
    render();
})();
