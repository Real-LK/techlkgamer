/* ============================================================
   TechLKGamer — Site Logic
   ============================================================ */

'use strict';

/* ---------- Footer year ---------- */
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ============================================================
   NAVIGATION — Home is the default page
   ============================================================ */
const pages = {
  home: document.getElementById('page-home'),
  contact: document.getElementById('page-contact'),
};

const navLinks = document.querySelectorAll('.nav-link[data-nav]');

function showPage(name) {
  if (!pages[name]) name = 'home';

  Object.entries(pages).forEach(([key, section]) => {
    const active = key === name;
    section.hidden = !active;
    section.classList.toggle('visible', active);
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === name);
  });

  // Close mobile menu after navigating
  navLinksEl.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');

  // Keep the URL hash in sync (no page reload)
  if (window.location.hash !== '#' + name) {
    history.replaceState(null, '', '#' + name);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-trigger the stat counters when returning Home
  if (name === 'home') animateStats();
}

document.querySelectorAll('[data-nav]').forEach((el) => {
  el.addEventListener('click', (event) => {
    const target = el.dataset.nav;
    if (!target || !pages[target]) return;
    event.preventDefault();
    showPage(target);
  });
});

/* ============================================================
   MOBILE HAMBURGER MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinksEl.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

// Close the mobile menu when clicking outside of it
document.addEventListener('click', (event) => {
  if (!navLinksEl.classList.contains('open')) return;
  if (navLinksEl.contains(event.target) || hamburger.contains(event.target)) return;
  navLinksEl.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
});

/* ============================================================
   NAVBAR SHADOW ON SCROLL
   ============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ============================================================
   TYPED TAGLINE (Home hero)
   ============================================================ */
const typedEl = document.getElementById('typed-text');
const phrases = [
  'Gaming. Content. Community.',
  'New videos every week.',
  'Thanks for stopping by!',
];
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const current = phrases[phraseIndex];

  if (!deleting) {
    charIndex++;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      return setTimeout(typeLoop, 1800);
    }
    return setTimeout(typeLoop, 45);
  }

  charIndex--;
  typedEl.textContent = current.slice(0, charIndex);
  if (charIndex === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    return setTimeout(typeLoop, 350);
  }
  return setTimeout(typeLoop, 22);
}

if (typedEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  typeLoop();
} else if (typedEl) {
  typedEl.textContent = phrases[0];
}

/* ============================================================
   ANIMATED STAT COUNTERS
   ============================================================ */
const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

function animateStats() {
  statNumbers.forEach((el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress); // easeOutExpo
      const value = progress === 1 ? target : Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
  statsAnimated = true;
}

/* ============================================================
   CONTACT FORM — validation + fake send
   ============================================================ */
const form = document.getElementById('contactForm');
const formError = document.getElementById('formError');
const formSuccess = document.getElementById('formSuccess');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function markValidity(input, valid) {
  input.classList.toggle('invalid', !valid);
  return valid;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.hidden = true;
  formSuccess.hidden = true;

  const name = form.name;
  const email = form.email;
  const subject = form.subject;
  const message = form.message;

  const checks = [
    markValidity(name, name.value.trim().length >= 2),
    markValidity(email, EMAIL_RE.test(email.value.trim())),
    markValidity(subject, subject.value.trim().length >= 2),
    markValidity(message, message.value.trim().length >= 10),
  ];

  if (checks.includes(false)) {
    formError.textContent = 'Please fill everything in — message needs at least 10 characters.';
    formError.hidden = false;
    return;
  }

  // No backend: simulate a send, then confirm to the user
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  setTimeout(() => {
    form.reset();
    form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Send Message <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>';
    formSuccess.hidden = false;
  }, 900);
});

// Clear the red highlight as the user fixes a field
form.querySelectorAll('input, textarea').forEach((input) => {
  input.addEventListener('input', () => input.classList.remove('invalid'));
});

/* ============================================================
   STARFIELD CANVAS BACKGROUND
   ============================================================ */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let width = 0;
let height = 0;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  const density = Math.floor((width * height) / 9000);
  stars = Array.from({ length: density }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.4 + 0.3,
    baseAlpha: Math.random() * 0.6 + 0.25,
    twinkleSpeed: Math.random() * 0.02 + 0.008,
    phase: Math.random() * Math.PI * 2,
    drift: (Math.random() - 0.5) * 0.12,
  }));
}

function drawStars(time) {
  ctx.clearRect(0, 0, width, height);
  for (const star of stars) {
    star.x += star.drift;
    if (star.x < 0) star.x = width;
    if (star.x > width) star.x = 0;

    const alpha = star.baseAlpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.phase));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#bcd0ff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#2f6bff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  requestAnimationFrame(drawStars);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
if (!reducedMotion) {
  requestAnimationFrame(drawStars);
} else {
  // Static stars for reduced motion
  drawStars(0);
}

/* ============================================================
   INIT — land on Home by default (respect #hash if present)
   ============================================================ */
const initial = window.location.hash.replace('#', '');
showPage(pages[initial] ? initial : 'home');
animateStats();
