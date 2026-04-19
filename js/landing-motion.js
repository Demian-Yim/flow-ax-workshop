/* ═══════════════════════════════════════════════════════════
   FLOW~ AX — Playful Motion Layer
   Custom cursor · Magnetic hovers · Scroll reveal · Parallax
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Skip on touch / reduced motion
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || isReduced) return;

  // ─── Custom cursor ──────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const follow = document.getElementById('cursorFollow');
  if (cursor && follow) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let fx = mouseX;
    let fy = mouseY;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    // Smooth lerp for follow ring
    function animate() {
      fx += (mouseX - fx) * 0.15;
      fy += (mouseY - fy) * 0.15;
      follow.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    }
    animate();

    // Active state on interactive elements
    const interactive = document.querySelectorAll('a, button, input, .svc-row, .wcard, .role-option, .code-input');
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        follow.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        follow.classList.remove('active');
      });
    });

    // Hide on leave window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      follow.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      follow.style.opacity = '1';
    });
  }

  // ─── Magnetic buttons ───────────────────────────────────────
  const magneticElements = document.querySelectorAll('.btn--solid, .nav__pill, .wcard__cta, .footer__mail');
  magneticElements.forEach(el => {
    const strength = el.classList.contains('footer__mail') ? 0.18 : 0.28;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ─── Scroll reveal ──────────────────────────────────────────
  const reveal = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  };
  const revealObs = new IntersectionObserver(reveal, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });
  const revealTargets = document.querySelectorAll(
    '.section-head, .svc-row, .wcard, .principle, .studio__col, .enter__card'
  );
  revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .7s cubic-bezier(0.2, 0.8, 0.2, 1), transform .7s cubic-bezier(0.2, 0.8, 0.2, 1)';
    revealObs.observe(el);
  });

  // CSS class for when revealed
  const style = document.createElement('style');
  style.textContent = `
    .revealed { opacity: 1 !important; transform: translateY(0) !important; }
  `;
  document.head.appendChild(style);

  // ─── Hero word stagger on load ──────────────────────────────
  const words = document.querySelectorAll('.hero__title .word');
  words.forEach((word, i) => {
    word.style.opacity = '0';
    word.style.transform = 'translateY(40px)';
    word.style.transition = `opacity .8s cubic-bezier(0.2, 0.8, 0.2, 1) ${0.1 + i * 0.08}s, transform .8s cubic-bezier(0.2, 0.8, 0.2, 1) ${0.1 + i * 0.08}s`;
  });
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      words.forEach(word => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      });
    });
  });

  // ─── Admin close-X ──────────────────────────────────────────
  const adminCloseX = document.getElementById('adminCloseX');
  const adminModal = document.getElementById('adminModal');
  if (adminCloseX && adminModal) {
    adminCloseX.addEventListener('click', () => {
      adminModal.classList.remove('active');
    });
  }

  // ─── Pause marquee on hover ─────────────────────────────────
  const marqueeTrack = document.querySelector('.marquee__track');
  if (marqueeTrack) {
    const parent = marqueeTrack.parentElement;
    parent.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    parent.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }

})();
