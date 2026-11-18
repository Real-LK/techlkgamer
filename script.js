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
  games: document.getElementById('page-games'),
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
   GAMES PAGE — copy in-game name to clipboard
   ============================================================ */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers / non-secure contexts
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  }
}

document.querySelectorAll('.copy-btn').forEach((button) => {
  const label = button.querySelector('.copy-label');
  const originalLabel = label ? label.textContent : '';
  button.addEventListener('click', async () => {
    const ok = await copyText(button.dataset.copy || '');
    if (!label) return;
    label.textContent = ok ? 'Copied!' : 'Failed';
    button.classList.add('copied');
    setTimeout(() => {
      label.textContent = originalLabel;
      button.classList.remove('copied');
    }, 1600);
  });
});

/* ============================================================
   CONTACT FORM — validation + SilentForms backend
   The access key lives in the hidden "accessKey" input in index.html.
   (Client-side by design; SilentForms keys are public-by-design.)
   ============================================================ */
const form = document.getElementById('contactForm');
const formError = document.getElementById('formError');
const formSuccess = document.getElementById('formSuccess');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function markValidity(input, valid) {
  input.classList.toggle('invalid', !valid);
  return valid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.hidden = true;
  formSuccess.hidden = true;

  const name = form.elements.namedItem('name');
  const email = form.elements.namedItem('email');
  const subject = form.elements.namedItem('subject');
  const message = form.elements.namedItem('message');

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

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn.innerHTML;

  // accessKey comes from the hidden input in the form; FormData picks it up below
  const accessKey = (form.elements.namedItem('accessKey')?.value || '').trim();
  if (!accessKey) {
    formError.textContent = 'This form isn’t configured yet — the SilentForms access key is blank in index.html.';
    formError.hidden = false;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const data = Object.fromEntries(new FormData(form)); // includes accessKey + sf_extra honeypot
    data.accessKey = accessKey;
    const response = await fetch('https://silentforms.com/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => null);

    if (response.ok && result && result.status === 'success') {
      form.reset();
      form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
      formSuccess.hidden = false;
    } else {
      formError.textContent = (result && result.message) || 'Message could not be sent. Please try again later.';
      formError.hidden = false;
    }
  } catch (err) {
    formError.textContent = 'Network error — please check your connection and try again.';
    formError.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHTML;
  }
});

// Clear the red highlight as the user fixes a field
form.querySelectorAll('input, textarea').forEach((input) => {
  input.addEventListener('input', () => input.classList.remove('invalid'));
});

/* ============================================================
   INIT — land on Home by default (respect #hash if present)
   ============================================================ */
const initial = window.location.hash.replace('#', '');
showPage(pages[initial] ? initial : 'home');
animateStats();
