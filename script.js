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
  body.classList.remove('menu-open');

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
const body = document.body;

hamburger.addEventListener('click', () => {
  const open = navLinksEl.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  body.classList.toggle('menu-open', open);
});

// Close the mobile menu when clicking outside of it
document.addEventListener('click', (event) => {
  if (!navLinksEl.classList.contains('open')) return;
  if (navLinksEl.contains(event.target) || hamburger.contains(event.target)) return;
  navLinksEl.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  body.classList.remove('menu-open');
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
   HOMEPAGE — Leave a Like! (stored locally on this device)
   ============================================================ */
const likeBtn = document.getElementById('likeBtn');
const likeCountEl = document.getElementById('likeCount');
const LIKE_KEY = 'tlkg-likes';

if (likeBtn && likeCountEl) {
  const LIKE_STATE_KEY = 'tlkg-liked';
  let likes = Math.max(0, Number(localStorage.getItem(LIKE_KEY)) || 0);
  let liked = localStorage.getItem(LIKE_STATE_KEY) === '1';

  const renderLikes = () => {
    likeCountEl.textContent = String(likes);
    likeBtn.classList.toggle('liked', liked);
    likeBtn.setAttribute('aria-pressed', String(liked));
  };

  likeBtn.addEventListener('click', () => {
    liked = !liked;
    likes = Math.max(0, likes + (liked ? 1 : -1));
    localStorage.setItem(LIKE_KEY, String(likes));
    localStorage.setItem(LIKE_STATE_KEY, liked ? '1' : '0');
    renderLikes();
    // Restart the pop animation
    likeBtn.classList.remove('liked-anim');
    void likeBtn.offsetWidth;
    likeBtn.classList.add('liked-anim');
  });

  renderLikes();
}

/* ============================================================
   YOUTUBE SEARCH (Home) — searches ONLY this channel's videos
   ============================================================ */

/* ⚠️  PASTE YOUR YOUTUBE DATA API v3 KEY BETWEEN THE QUOTES BELOW:
   Google Cloud console → APIs & Services → Credentials → API key.
   Enable "YouTube Data API v3" and restrict the key to your site's
   HTTP referrer, since anything in this file is public. */
const YOUTUBE_API_KEY = 'AIzaSyD0YeQKh8Cz_yTd8Utemwr6UB4tiVMDcbg';

/* The only channel this search looks in */
const YT_CHANNEL_HANDLE = '@LK_techgamer-y3m';

const ytForm = document.getElementById('ytSearchForm');
const ytInput = document.getElementById('ytSearchInput');
const ytBtn = document.getElementById('ytSearchBtn');
const ytStatusEl = document.getElementById('ytSearchStatus');
const ytResultsEl = document.getElementById('ytResults');

let ytChannelId = null;
let ytLatestRequest = 0;

if (ytForm && ytInput && ytBtn && ytStatusEl && ytResultsEl) {
  const setStatus = (text, isError) => {
    ytStatusEl.textContent = text || '';
    ytStatusEl.classList.toggle('error', Boolean(isError));
  };

  const apiGet = async (endpoint, params) => {
    const url = new URL('https://www.googleapis.com/youtube/v3/' + endpoint);
    Object.keys(params).forEach((param) => url.searchParams.set(param, params[param]));
    url.searchParams.set('key', YOUTUBE_API_KEY);

    const response = await fetch(url.toString());
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (payload && payload.error && payload.error.message) ||
        'YouTube API error (' + response.status + ')';
      throw new Error(message);
    }
    return payload || {};
  };

  // @handle → channel ID (cached for the rest of the visit)
  const resolveChannelId = async () => {
    if (ytChannelId) return ytChannelId;
    const payload = await apiGet('channels', { part: 'id', forHandle: YT_CHANNEL_HANDLE });
    const id = payload.items && payload.items[0] && payload.items[0].id;
    if (!id) throw new Error('Could not find ' + YT_CHANNEL_HANDLE + ' on YouTube.');
    ytChannelId = id;
    return id;
  };

  const timeAgo = (iso) => {
    const then = new Date(iso).getTime();
    if (!then) return '';
    const days = Math.max(0, Math.floor((Date.now() - then) / 86400000));
    if (days < 1) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return days + ' days ago';
    const months = Math.floor(days / 30);
    if (months < 12) return months + (months === 1 ? ' month ago' : ' months ago');
    const years = Math.floor(months / 12);
    return years + (years === 1 ? ' year ago' : ' years ago');
  };

  const renderResults = (items) => {
    ytResultsEl.textContent = '';

    items.forEach((item) => {
      const snippet = item.snippet || {};
      const videoId = item.id && item.id.videoId;
      if (!videoId) return;

      const link = document.createElement('a');
      link.className = 'yt-result';
      link.href = 'https://www.youtube.com/watch?v=' + videoId;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      const thumbWrap = document.createElement('span');
      thumbWrap.className = 'yt-thumb';
      const thumbs = snippet.thumbnails || {};
      const thumb = thumbs.medium || thumbs.default || {};
      if (thumb.url) {
        const img = document.createElement('img');
        img.src = thumb.url;
        img.alt = '';
        img.loading = 'lazy';
        thumbWrap.appendChild(img);
      }

      const body = document.createElement('span');
      body.className = 'yt-result-body';

      const title = document.createElement('span');
      title.className = 'yt-result-title';
      title.textContent = snippet.title || 'Untitled video';

      const meta = document.createElement('span');
      meta.className = 'yt-result-meta';
      meta.textContent = timeAgo(snippet.publishedAt);

      const desc = document.createElement('span');
      desc.className = 'yt-result-desc';
      desc.textContent = (snippet.description || '').replace(/\s+/g, ' ').trim().slice(0, 120);

      body.append(title, meta, desc);
      link.append(thumbWrap, body);
      ytResultsEl.appendChild(link);
    });
  };

  const runSearch = async (query) => {
    const term = query.trim();
    ytResultsEl.textContent = '';

    if (!term) {
      setStatus('Type something to search my videos.');
      return;
    }

    if (!YOUTUBE_API_KEY.trim() || YOUTUBE_API_KEY.indexOf('PASTE_') === 0) {
      setStatus('Search isn’t set up yet — add a YouTube Data API key in script.js.', true);
      return;
    }

    const requestNumber = ++ytLatestRequest;
    ytBtn.disabled = true;
    setStatus('Searching…');

    try {
      const channelId = await resolveChannelId();
      const payload = await apiGet('search', {
        part: 'snippet',
        channelId: channelId,
        q: term,
        type: 'video',
        order: 'relevance',
        maxResults: '8',
      });

      // A newer search started while this one was in flight — drop this one
      if (requestNumber !== ytLatestRequest) return;

      const items = payload.items || [];
      renderResults(items);
      setStatus(
        items.length
          ? items.length + (items.length === 1 ? ' video found' : ' videos found')
          : 'No videos matched “' + term + '”.',
        !items.length
      );
    } catch (error) {
      if (requestNumber !== ytLatestRequest) return;
      setStatus(error.message || 'Search failed — please try again.', true);
    } finally {
      if (requestNumber === ytLatestRequest) ytBtn.disabled = false;
    }
  };

  ytForm.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch(ytInput.value);
  });
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

document.querySelectorAll('.copy-btn[data-copy]').forEach((button) => {
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
