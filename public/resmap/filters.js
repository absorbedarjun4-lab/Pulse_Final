/* ═══════════════════════════════════════════════════
   Pulse — Filter Panel Module
   ═══════════════════════════════════════════════════ */

const FilterModule = (() => {
    let activeCategories = new Set(CATEGORIES.map(c => c.id));
    let radius = 5;
    let openNow = false;
    let searchQuery = '';
    let onChangeCallback = null;

    function init(onChange) {
        onChangeCallback = onChange;
        renderCategoryButtons();
        bindEvents();
    }

    function renderCategoryButtons() {
        const container = document.getElementById('category-filters');
        container.innerHTML = '';
        CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `cat-btn ${activeCategories.has(cat.id) ? 'active' : ''}`;
            btn.textContent = cat.label;
            btn.dataset.cat = cat.id;
            btn.addEventListener('click', () => toggleCategory(cat.id, btn));
            container.appendChild(btn);
        });
    }

    function toggleCategory(id, btn) {
        if (activeCategories.has(id)) {
            activeCategories.delete(id);
            btn.classList.remove('active');
        } else {
            activeCategories.add(id);
            btn.classList.add('active');
        }
        emitChange();
    }

    function bindEvents() {
        // Radius slider
        const slider = document.getElementById('radius-slider');
        const valueLabel = document.getElementById('radius-value');
        slider.addEventListener('input', e => {
            radius = parseInt(e.target.value);
            valueLabel.textContent = `${radius} km`;
            emitChange();
        });

        // Open now toggle
        document.getElementById('open-now-toggle').addEventListener('change', e => {
            openNow = e.target.checked;
            emitChange();
        });

        // Search
        const searchInput = document.getElementById('search-input');
        let debounce;
        searchInput.addEventListener('input', e => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                searchQuery = e.target.value.toLowerCase().trim();
                emitChange();
            }, 250);
        });

        // Mobile panel toggle
        const panel = document.getElementById('filter-panel');
        const openBtn = document.getElementById('filter-toggle-open');
        const closeBtn = document.getElementById('filter-toggle-close');

        // Backdrop element
        const backdrop = document.createElement('div');
        backdrop.className = 'panel-backdrop';
        backdrop.id = 'filter-backdrop';
        document.body.appendChild(backdrop);

        openBtn.addEventListener('click', () => {
            panel.classList.add('open');
            backdrop.classList.add('active');
        });

        const closePanel = () => {
            panel.classList.remove('open');
            backdrop.classList.remove('active');
        };

        closeBtn.addEventListener('click', closePanel);
        backdrop.addEventListener('click', closePanel);
    }

    function applyFilters(resources) {
        return resources.filter(r => {
            if (!activeCategories.has(r.category)) return false;
            if (r.distance > radius) return false;
            if (openNow && !r.isOpen) return false;
            if (searchQuery && !r.name.toLowerCase().includes(searchQuery) && !r.address.toLowerCase().includes(searchQuery)) return false;
            return true;
        });
    }

    function emitChange() {
        if (onChangeCallback) onChangeCallback();
    }

    return { init, applyFilters };
})();
