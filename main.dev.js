// ============================================
// Mobile Navigation
// ============================================
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const navbar = document.getElementById('navbar');
  if (!toggle || !navbar) return;

  toggle.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  const mobileLinks = document.querySelectorAll('.nav-mobile a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navbar.classList.contains('nav-open')) {
      navbar.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ============================================
// Scroll Animations (GSAP ScrollTrigger)
// Must run after initSmoothScroll so the smoother exists before any ScrollTrigger.
// ============================================
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  // Fallback if GSAP/ScrollTrigger failed to load: the original IntersectionObserver reveal
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    elements.forEach((el) => observer.observe(el));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gsap-scroll');
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const heroContent = document.querySelector('.hero-content');
    let cleanupHeadline = () => {};

    // Hero: staggered intro on load, then the block drifts up and fades as the next section arrives
    if (heroContent) {
      heroContent.classList.add('is-visible');
      const headline = heroContent.querySelector('h1');
      const resumeLink = heroContent.querySelector('.hero-cta-wrapper');
      if (headline) {
        const original = headline.textContent.trim();
        const originalMarkup = headline.innerHTML;
        headline.setAttribute('aria-label', original);
        headline.textContent = '';
        const words = [];
        original.split(/(\s+)/).filter(Boolean).forEach((part) => {
          if (/^\s+$/.test(part)) {
            headline.appendChild(document.createTextNode(part));
            return;
          }
          const mask = document.createElement('span');
          mask.className = 'hero-word-mask';
          if (part === 'I’m' || part === 'John,') mask.classList.add('hero-name-hit');
          mask.setAttribute('aria-hidden', 'true');
          const word = document.createElement('span');
          word.className = 'hero-word';
          word.textContent = part;
          mask.appendChild(word);
          headline.appendChild(mask);
          words.push(word);
        });

        // Sample the same heading-wide gradient for every independently animated word.
        headline.classList.add('hero-headline-split');
        let active = true;
        const alignGradient = () => {
          if (!active) return;
          const bounds = headline.getBoundingClientRect();
          const offsets = words.map(word => word.getBoundingClientRect().left - bounds.left);
          headline.style.setProperty('--hero-gradient-width', `${bounds.width}px`);
          words.forEach((word, index) => word.style.setProperty('--hero-gradient-x', `${-offsets[index]}px`));
        };
        alignGradient();
        const headlineResize = new ResizeObserver(alignGradient);
        headlineResize.observe(headline);
        document.fonts.ready.then(alignGradient);
        cleanupHeadline = () => {
          active = false;
          headlineResize.disconnect();
          headline.innerHTML = originalMarkup;
          headline.removeAttribute('aria-label');
          headline.classList.remove('hero-headline-split');
          headline.style.removeProperty('--hero-gradient-width');
        };

        const intro = gsap.timeline({ delay: 0.12 });
        intro.fromTo(words, { yPercent: 115, autoAlpha: 0, filter: 'blur(10px)' }, {
          yPercent: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: 0.82,
          ease: 'power4.out',
          stagger: 0.045,
          clearProps: 'filter,transform,opacity,visibility'
        });
        if (resumeLink) intro.fromTo(resumeLink, { y: 14, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility'
        }, '-=0.25');
      }
      gsap.to(heroContent, {
        y: -70,
        autoAlpha: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // These wrappers stay put; their children reveal one by one instead
    const wrappers = gsap.utils.toArray('#experience .animate-on-scroll');
    wrappers.forEach((el) => el.classList.add('is-visible'));

    const targets = [
      ...gsap.utils.toArray('.shots-marquee-section'),
      ...gsap.utils.toArray('.animate-on-scroll').filter((el) => el !== heroContent && !wrappers.includes(el)),
      ...gsap.utils.toArray('.experience-header, .experience-item')
    ];

    gsap.set(targets, { autoAlpha: 0, y: 48 });

    ScrollTrigger.batch(targets, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.12,
          overwrite: true,
          onComplete: () => {
            // Hand control back to CSS (hover states) once the reveal is done
            batch.forEach((el) => {
              if (el.classList.contains('animate-on-scroll')) el.classList.add('is-visible', 'reveal-done');
            });
            gsap.set(batch, { clearProps: 'opacity,visibility,transform' });
          }
        })
    });
    return cleanupHeadline;
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    elements.forEach((el) => el.classList.add('is-visible'));
  });
}

// ============================================
// Smooth Scroll (GSAP ScrollSmoother) + anchor links
// Only #smooth-content is smoothed; the fixed nav, dock and overlays sit outside the wrapper.
// ============================================
let smoother = null;

function initSmoothScroll() {
  const hasSmoother = typeof ScrollSmoother !== 'undefined' && document.getElementById('smooth-wrapper');

  if (hasSmoother) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    // matchMedia keeps native scrolling for reduced-motion users and cleans up if the preference changes
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2
      });
      return () => { smoother = null; };
    });
    // Web fonts change text height, so re-measure once they have loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('navbar')?.offsetHeight || 64;
        if (smoother) {
          const top = target.getBoundingClientRect().top - document.getElementById('smooth-content').getBoundingClientRect().top - navHeight;
          smoother.scrollTo(Math.max(0, top), true);
        } else {
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      }
    });
  });
}

// ============================================
// Initialize All
// ============================================

function initModal() {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;

  const triggers = document.querySelectorAll('[data-modal-trigger="contact-modal"]');
  const closeBtn = modal.querySelector('.modal-close');
  let returnFocus = null;
  modal.inert = true;

  const openModal = (e) => {
    e.preventDefault();
    returnFocus = e.currentTarget;
    modal.inert = false;
    modal.setAttribute('aria-hidden', 'false');
    // Close mobile nav if it's open
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    if (navbar && navbar.classList.contains('nav-open')) {
      navbar.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (modal.getAttribute('aria-hidden') === 'false') closeBtn.focus({ preventScroll: true });
    }));
  };

  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;
    returnFocus?.focus({ preventScroll: true });
  };

  triggers.forEach(trigger => trigger.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);

  // Close when clicking outside modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') !== 'false') return;
    if (e.key === 'Escape') {
      closeModal();
    }
    if (e.key === 'Tab') {
      const controls = [...modal.querySelectorAll('a[href], button, input:not([type="hidden"]), textarea, select, [tabindex="0"]')]
        .filter(control => !control.disabled && control.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// ============================================
// Decorative light behind the hero content
// ============================================
function initHeroSpotlight() {
  const hero = document.querySelector('.hero');
  const content = hero?.querySelector('.hero-content');
  const light = hero?.querySelector('.hero-spotlight');
  if (!content || !light || typeof gsap === 'undefined') return;

  gsap.matchMedia().add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    gsap.set(light, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(light, 'x', { duration: .45, ease: 'power3.out' });
    const yTo = gsap.quickTo(light, 'y', { duration: .45, ease: 'power3.out' });
    const position = event => {
      const bounds = hero.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    const enter = event => {
      const point = position(event);
      xTo(point.x, point.x);
      yTo(point.y, point.y);
      hero.classList.add('is-spotlit');
    };
    const move = event => {
      const point = position(event);
      xTo(point.x);
      yTo(point.y);
    };
    const leave = () => hero.classList.remove('is-spotlit');
    content.addEventListener('pointerenter', enter);
    content.addEventListener('pointermove', move);
    content.addEventListener('pointerleave', leave);
    return () => {
      leave();
      content.removeEventListener('pointerenter', enter);
      content.removeEventListener('pointermove', move);
      content.removeEventListener('pointerleave', leave);
    };
  });
}

// The portrait is outside the word masks so the intro cannot clip it.
function initHeroNamePortrait() {
  const content = document.querySelector('.hero-content');
  const headline = content?.querySelector('h1');
  const portrait = content?.querySelector('.hero-name-portrait');
  if (!headline || !portrait) return;
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hide = () => content.classList.remove('is-name-hovered');
  headline.addEventListener('pointermove', event => {
    if (!pointer.matches || event.pointerType === 'touch') return;
    const parts = [...headline.querySelectorAll('.hero-name, .hero-name-hit')];
    if (!parts.length) return;
    const boxes = parts.map(part => part.getBoundingClientRect());
    const left = Math.min(...boxes.map(box => box.left));
    const right = Math.max(...boxes.map(box => box.right));
    const top = Math.min(...boxes.map(box => box.top));
    const bottom = Math.max(...boxes.map(box => box.bottom));
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) { hide(); return; }
    const container = content.getBoundingClientRect();
    portrait.style.left = `${(left + right) / 2 - container.left - portrait.offsetWidth / 2}px`;
    portrait.style.top = `${top - container.top - portrait.offsetHeight + 8}px`;
    content.classList.add('is-name-hovered');
  }, { passive: true });
  headline.addEventListener('pointerleave', hide);
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide, { passive: true });
  pointer.addEventListener('change', hide);
}

// Controls for the continuous CSS image marquee.
function initMarquee() {
  const section = document.querySelector('.shots-marquee-section');
  const toggle = section?.querySelector('.hero-marquee-toggle');
  if (!section || !toggle) return;

  // CSS owns the continuous loop; JavaScript only controls the pause button.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = null;
  const syncPlayback = () => {
    const paused = userPaused ?? reducedMotion.matches;
    section.style.setProperty('--marquee-state', paused ? 'paused' : 'running');
    toggle.textContent = paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', paused ? 'Resume image scrolling' : 'Pause image scrolling');
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    userPaused = !(userPaused ?? reducedMotion.matches);
    syncPlayback();
  });
  reducedMotion.addEventListener('change', () => {
    userPaused = null;
    syncPlayback();
  });
  syncPlayback();
}
// ============================================
// Floating Dock Scroll Visibility
// ============================================
function initFloatingDockVisibility() {
  const dock = document.querySelector('.floating-dock');
  const hero = document.getElementById('home');
  if (!dock || !hero) return;

  const handleScroll = () => {
    const heroHeight = hero.offsetHeight;
    const pageHeight = document.querySelector('#smooth-content')?.scrollHeight || document.documentElement.scrollHeight;
    const atBottom = window.scrollY + window.innerHeight >= pageHeight - 72;
    const visible = window.scrollY > heroHeight * 0.8 && !atBottom;
    dock.classList.toggle('dock-visible', visible);
    dock.inert = !visible;
    dock.setAttribute('aria-hidden', String(!visible));
  };

  // Check visibility on load in case the page is already scrolled down
  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  new ResizeObserver(handleScroll).observe(document.querySelector('#smooth-content'));
}

// Stay attached to the viewport, reveal on upward scroll, and keep open menus usable.
function initDirectionalNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let lastY = Math.max(0, window.scrollY);
  let direction = 0, distance = 0;
  const reveal = () => nav.classList.remove('nav-hidden');
  const update = () => {
    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;
    lastY = y;
    if (y < nav.offsetHeight || nav.classList.contains('nav-open') || nav.querySelector(':focus-visible')) {
      reveal(); distance = 0; return;
    }
    if (Math.abs(delta) < .5) return;
    const nextDirection = Math.sign(delta);
    if (nextDirection !== direction) distance = 0;
    direction = nextDirection;
    distance += Math.abs(delta);
    if (distance >= (direction < 0 ? 6 : 14)) nav.classList.toggle('nav-hidden', direction > 0);
  };
  window.addEventListener('scroll', update, { passive: true });
  nav.addEventListener('focusin', reveal);
  nav.querySelector('#nav-toggle')?.addEventListener('click', reveal);
  window.addEventListener('resize', () => { lastY = Math.max(0, window.scrollY); distance = 0; reveal(); }, { passive: true });
}

function initFooterBlurVisibility() {
  const footer = document.querySelector('#contact');
  const blur = document.querySelector('.progressive-blur');
  if (!footer || !blur) return;
  new IntersectionObserver(entries => {
    blur.classList.toggle('footer-in-view', entries[0].isIntersecting);
  }, { threshold: 0 }).observe(footer);
}

// ============================================
// Anti-Copy / Content Protection
// ============================================
function initProtection() {
  // Disable Right Click (Context Menu)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Disable specific developer keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Windows/Linux: Ctrl+Shift+I / J / C / U / S
    if (e.ctrlKey && (
      (e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      (e.key === 'U' || e.key === 'u') ||
      (e.key === 'S' || e.key === 's')
    )) {
      e.preventDefault();
    }
    // Mac: Cmd+Option+I / J / U, Cmd+S
    if (e.metaKey && (
      (e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'U' || e.key === 'u')) ||
      (e.key === 'S' || e.key === 's')
    )) {
      e.preventDefault();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMarquee();
  initMobileNav();
  initDirectionalNav();
  initSmoothScroll(); // creates the ScrollSmoother, which must exist before any ScrollTrigger
  initScrollAnimations();
  initHeroSpotlight();
  initHeroNamePortrait();
  initModal();

  initFloatingDockVisibility();
  initFooterBlurVisibility();
  initProtection();
  restoreSectionFromHash();
});

// Direct links from a case study must land on the selected section after
// ScrollSmoother and the web fonts have finished measuring the home page.
function restoreSectionFromHash() {
  if (!location.hash) return;
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
  Promise.all([document.fonts?.ready, loaded]).then(() => requestAnimationFrame(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    const offset = document.getElementById('navbar')?.offsetHeight || 64;
    if (smoother) {
      const top = target.getBoundingClientRect().top - document.getElementById('smooth-content').getBoundingClientRect().top - offset;
      smoother.scrollTop(Math.max(0, top));
    }
    else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior: 'instant' });
  }));
}
