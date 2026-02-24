/* ═══════════════════════════════════════════════════
   ripples.js — SOS click concentric ripple rings
   ═══════════════════════════════════════════════════ */

const Ripples = (() => {
    'use strict';

    /* ── Config ──────────────────────────────────────── */
    const RING_COUNT = 4;
    const MAX_RADIUS = Math.max(window.innerWidth, window.innerHeight) * 0.7;
    const EXPAND_SPEED = 1.6; // px per frame — calm, gentle
    const RING_COLORS = [
        { r: 247, g: 215, b: 148 }, // champagne
        { r: 237, g: 166, b: 163 }, // dusty rose
        { r: 252, g: 251, b: 251 }, // pearl
        { r: 247, g: 215, b: 148 }, // champagne
        { r: 237, g: 166, b: 163 }, // dusty rose
    ];

    /* ── State ───────────────────────────────────────── */
    let canvas, ctx;
    let W, H;
    let rings = [];
    let rafId = null;
    let animating = false;

    /* ── Ring class ──────────────────────────────────── */
    class Ring {
        constructor(cx, cy, delay, color) {
            this.cx = cx;
            this.cy = cy;
            this.radius = 0;
            this.delay = delay;
            this.color = color;
            this.alpha = 0.35;
            this.started = false;
            this.elapsed = 0;
        }

        update() {
            this.elapsed++;
            if (this.elapsed < this.delay) return;
            this.started = true;
            this.radius += EXPAND_SPEED + this.radius * 0.004;
            this.alpha = Math.max(0, 0.35 * (1 - this.radius / MAX_RADIUS));
        }

        draw(ctx) {
            if (!this.started || this.alpha <= 0) return;
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        get done() {
            return this.started && this.alpha <= 0;
        }
    }

    /* ── Animation Loop ─────────────────────────────── */
    function frame() {
        ctx.clearRect(0, 0, W, H);

        let allDone = true;
        for (let i = 0; i < rings.length; i++) {
            rings[i].update();
            rings[i].draw(ctx);
            if (!rings[i].done) allDone = false;
        }

        if (allDone) {
            animating = false;
            rings = [];
            ctx.clearRect(0, 0, W, H);
            return;
        }

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
        ctx.scale(dpr, dpr);
    }

    /* ── Public: spawn ──────────────────────────────── */
    function spawn(cx, cy) {
        for (let i = 0; i < RING_COUNT; i++) {
            rings.push(new Ring(cx, cy, i * 18, RING_COLORS[i]));
        }
        if (!animating) {
            animating = true;
            rafId = requestAnimationFrame(frame);
        }
    }

    /* ── Init ────────────────────────────────────────── */
    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    return { init, spawn };
})();
