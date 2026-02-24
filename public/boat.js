/* ═══════════════════════════════════════════════════
   boat.js — Animated boat navigation + SOS displacement
   ═══════════════════════════════════════════════════ */

const Boat = (() => {
    'use strict';

    /* ── State ───────────────────────────────────────── */
    let boatEl, sosWrapper, sosBtn;
    let rafId = null;
    let animating = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Easing (smooth sinusoidal) ──────────────────── */
    function easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    /* ── Get element center (viewport coords) ─────── */
    function getCenter(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    /* ── Float bob (synced to wave) ────────────────── */
    function getFloatOffset(time) {
        return Math.sin(time * 0.04) * 6 + Math.sin(time * 0.025) * 3;
    }

    function getTilt(time) {
        return Math.sin(time * 0.03) * 3; // degrees
    }

    /* ── SOS Displacement ──────────────────────────── */
    function updateSOSDisplacement(boatX, boatY) {
        const sosCenter = getCenter(sosBtn);
        const dx = boatX - sosCenter.x;
        const dy = boatY - sosCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const threshold = 250;

        if (dist < threshold) {
            const strength = 1 - (dist / threshold);
            const displacement = strength * 60; // max 60px down
            sosWrapper.style.transform = `translateY(${displacement}px)`;
        } else {
            sosWrapper.style.transform = 'translateY(0)';
        }
    }

    function resetSOSDisplacement() {
        sosWrapper.style.transform = 'translateY(0)';
    }

    /* ── Navigate To ───────────────────────────────── */
    function navigateTo(targetEl, onArrive) {
        if (animating) return;
        animating = true;

        // Reduced motion: skip animation
        if (reducedMotion) {
            if (onArrive) onArrive();
            animating = false;
            return;
        }

        // Boat enters from the left edge, vertically centered
        const start = { x: -60, y: window.innerHeight / 2 };
        const target = getCenter(targetEl);
        const duration = 7000; // ms — slow and smooth
        const startTime = performance.now();

        // Show boat at start
        boatEl.style.display = 'block';
        boatEl.style.opacity = '0';
        boatEl.style.left = start.x + 'px';
        boatEl.style.top = start.y + 'px';

        // Fade-in
        requestAnimationFrame(() => {
            boatEl.style.opacity = '1';
        });

        // Determine direction for flip
        const goingRight = target.x > start.x;
        boatEl.querySelector('.boat-svg').style.transform =
            goingRight ? 'scaleX(1)' : 'scaleX(-1)';

        let frameCount = 0;

        function tick(now) {
            const elapsed = now - startTime;
            const rawT = Math.min(elapsed / duration, 1);
            const t = easeInOutSine(rawT);

            // Interpolate position
            const x = start.x + (target.x - start.x) * t;
            const baseY = start.y + (target.y - start.y) * t;

            // Add float bob
            frameCount++;
            const floatY = getFloatOffset(frameCount);
            const tilt = getTilt(frameCount);

            const finalY = baseY + floatY;

            boatEl.style.left = x + 'px';
            boatEl.style.top = finalY + 'px';
            boatEl.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;

            // SOS displacement
            updateSOSDisplacement(x, finalY);

            if (rawT < 1) {
                rafId = requestAnimationFrame(tick);
            } else {
                // Arrived — fade out boat
                boatEl.style.opacity = '0';
                setTimeout(() => {
                    boatEl.style.display = 'none';
                    resetSOSDisplacement();
                    animating = false;
                    if (onArrive) onArrive();
                }, 500);
            }
        }

        rafId = requestAnimationFrame(tick);
    }

    /* ── Init ────────────────────────────────────────── */
    function init(boatElement, sosWrapperEl, sosBtnEl) {
        boatEl = boatElement;
        sosWrapper = sosWrapperEl;
        sosBtn = sosBtnEl;
    }

    function isAnimating() {
        return animating;
    }

    return { init, navigateTo, isAnimating };
})();
