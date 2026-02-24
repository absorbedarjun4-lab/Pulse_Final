document.addEventListener('DOMContentLoaded', () => {
    // Initialize Map
    window.mapModule.initMap();

    // Crisp, mechanical entry animations (Deta Surf style)
    const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 0.6 } });

    tl.to("#hero-tag", { opacity: 1, y: 0, delay: 0.1 })
        .to("#hero h1", { opacity: 1, y: 0 }, "-=0.4")
        .to("#hero-subtitle", { opacity: 1, y: 0 }, "-=0.3")
        .to("#map-container", { opacity: 1, y: 0 }, "-=0.2")
        .to("#bento-eta", { opacity: 1, y: 0 }, "-=0.3")
        .to("#bento-dist", { opacity: 1, y: 0 }, "-=0.25")
        .to("#bento-safety", { opacity: 1, y: 0 }, "-=0.2")
        .to("#sos-btn", { opacity: 1, y: 0 }, "-=0.1")
        .call(() => {
            document.getElementById('title-underline').classList.add('active');
        });

    // Control panel reveal
    gsap.set("#control-panel", { y: 12, opacity: 0 });
    gsap.to("#control-panel", { y: 0, opacity: 1, duration: 0.6, delay: 0.8, ease: "power4.out" });
});
