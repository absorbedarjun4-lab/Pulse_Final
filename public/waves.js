/* ═══════════════════════════════════════════════════
   waves.js — Realistic layered ocean wave canvas
   ═══════════════════════════════════════════════════ */

const Waves = (() => {
    'use strict';

    /* ── Palette ─────────────────────────────────────── */
    const PALETTE = {
        champagne: { r: 247, g: 215, b: 148 },
        dustyRose: { r: 237, g: 166, b: 163 },
        pearl: { r: 252, g: 251, b: 251 },
        midnight: { r: 25, g: 42, b: 86 },
        deep: { r: 14, g: 27, b: 61 },
    };

    /*
     * Each layer is composed of multiple harmonics for realism.
     * Primary wave + 2 sub-harmonics with different freq/amp ratios
     * create the organic feel of real water.
     */
    const WAVE_LAYERS = [
        {
            yOff: 0.58, color: PALETTE.deep, alpha: 0.40,
            harmonics: [
                { amp: 30, freq: 0.0025, speed: 0.012 },
                { amp: 14, freq: 0.006, speed: 0.008 },
                { amp: 6, freq: 0.014, speed: 0.020 },
            ]
        },
        {
            yOff: 0.63, color: PALETTE.midnight, alpha: 0.30,
            harmonics: [
                { amp: 24, freq: 0.003, speed: 0.015 },
                { amp: 10, freq: 0.008, speed: 0.010 },
                { amp: 5, freq: 0.018, speed: 0.025 },
            ]
        },
        {
            yOff: 0.68, color: PALETTE.champagne, alpha: 0.055,
            harmonics: [
                { amp: 18, freq: 0.004, speed: 0.018 },
                { amp: 8, freq: 0.010, speed: 0.012 },
                { amp: 3, freq: 0.022, speed: 0.030 },
            ]
        },
        {
            yOff: 0.73, color: PALETTE.dustyRose, alpha: 0.04,
            harmonics: [
                { amp: 14, freq: 0.005, speed: 0.020 },
                { amp: 6, freq: 0.012, speed: 0.014 },
                { amp: 2.5, freq: 0.025, speed: 0.035 },
            ]
        },
        {
            yOff: 0.78, color: PALETTE.pearl, alpha: 0.025,
            harmonics: [
                { amp: 10, freq: 0.006, speed: 0.022 },
                { amp: 4, freq: 0.015, speed: 0.016 },
                { amp: 2, freq: 0.030, speed: 0.040 },
            ]
        },
    ];

    /* ── State ───────────────────────────────────────── */
    let canvas, ctx;
    let W, H;
    let time = 0;
    let running = false;
    let rafId = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Public: getWaveY ────────────────────────────── */
    function getWaveY(x) {
        const layer = WAVE_LAYERS[0];
        let y = H * layer.yOff;
        for (const h of layer.harmonics) {
            y += Math.sin(x * h.freq + time * h.speed) * h.amp;
        }
        return y;
    }

    /* ── Compute Y at a point for a given layer ─────── */
    function computeY(x, layer) {
        let y = H * layer.yOff;
        for (const h of layer.harmonics) {
            y += Math.sin(x * h.freq + time * h.speed) * h.amp;
        }
        return y;
    }

    /* ── Drawing ─────────────────────────────────────── */
    function drawWave(layer) {
        const { color, alpha } = layer;

        ctx.beginPath();
        ctx.moveTo(0, H);

        // Sample every 2px for smoother curves
        for (let x = 0; x <= W; x += 2) {
            ctx.lineTo(x, computeY(x, layer));
        }

        ctx.lineTo(W, H);
        ctx.closePath();

        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.fill();
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);

        for (let i = 0; i < WAVE_LAYERS.length; i++) {
            drawWave(WAVE_LAYERS[i]);
        }

        time += 1;
        rafId = requestAnimationFrame(frame);
    }

    /* ── Resize ──────────────────────────────────────── */
    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ── Init ────────────────────────────────────────── */
    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        if (reducedMotion) {
            time = 0;
            ctx.clearRect(0, 0, W, H);
            for (let i = 0; i < WAVE_LAYERS.length; i++) drawWave(WAVE_LAYERS[i]);
            return;
        }

        running = true;
        rafId = requestAnimationFrame(frame);
    }

    function destroy() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
    }

    return { init, destroy, getWaveY };
})();
