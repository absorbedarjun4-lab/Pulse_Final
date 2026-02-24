/* ================================================
   PULSE TESTIMONIALS — Script
   Scroll reveal · Horizontal carousel · Counter
   ================================================ */

(function () {
  'use strict';

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const y = window.scrollY;
    if (y > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });


  /* ---------- Scroll Reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('visible'), delay * 140);
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));


  /* ---------- Horizontal Scroll Carousel ---------- */
  const carouselSection = document.querySelector('.carousel-section');
  const carouselTrack = document.getElementById('carouselTrack');

  if (carouselSection && carouselTrack) {
    function updateCarousel() {
      const rect = carouselSection.getBoundingClientRect();
      const sectionHeight = carouselSection.offsetHeight;
      const viewportH = window.innerHeight;
      const scrollableDistance = sectionHeight - viewportH;

      // How far we've scrolled into this section (0 = top aligns viewport top)
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

      // Total movement = track width - viewport width
      const trackWidth = carouselTrack.scrollWidth;
      const containerWidth = window.innerWidth;
      const maxTranslate = trackWidth - containerWidth + 80; // 80px padding buffer

      const translateX = progress * maxTranslate;
      carouselTrack.style.transform = `translateX(-${translateX}px)`;
    }

    window.addEventListener('scroll', updateCarousel, { passive: true });
    window.addEventListener('resize', updateCarousel, { passive: true });
    updateCarousel();
  }


  /* ---------- Counter Animation ---------- */
  const statNumbers = document.querySelectorAll('.impact__number[data-target]');
  let countersTriggered = false;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.floor(eased * target).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || countersTriggered) return;
        countersTriggered = true;
        statNumbers.forEach((el, i) => {
          setTimeout(() => animateCounter(el), i * 250);
        });
        statsObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );

  const impactSection = document.getElementById('impact');
  if (impactSection) statsObserver.observe(impactSection);

})();
