document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollAnimations();
  initParticleRing();
  initNavbar();
  initMobileNav();
});

// --- Mobile Navigation Toggle ---
function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  if (!navToggle || !navbar || !navLinks) return;

  // Toggle menu open/close
  navToggle.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navbar.classList.contains('nav-open')) {
      navbar.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}


// --- Custom Cursor ---
function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Track cursor position
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // Custom cursor position (for lerp)
  let cursorX = mouseX;
  let cursorY = mouseY;

  // Mouse move listener
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Initial display of cursor when mouse moves
    if (cursor.style.opacity === '0' || cursor.style.opacity === '') {
      cursor.style.opacity = '1';
    }
  });

  // Animation loop for smooth lerp (85% speed)
  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.85;
    cursorY += (mouseY - cursorY) * 0.85;

    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states for interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
    });
  });
}

// --- Scroll Entrance Animations & Stagger ---
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // If it's a grid container or has multiple children, we can stagger them
        // But here we put .animate-on-scroll on individual elements
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elements = document.querySelectorAll('.animate-on-scroll');

  // Add stagger delays for grid items (siblings)
  const grids = document.querySelectorAll('.grid');
  grids.forEach(grid => {
    const cards = grid.querySelectorAll('.card');
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 80}ms`;
    });
  });

  const blogList = document.querySelector('.blog-list');
  if (blogList) {
    const entries = blogList.querySelectorAll('.blog-entry');
    entries.forEach((entry, index) => {
      entry.style.transitionDelay = `${index * 80}ms`;
    });
  }

  elements.forEach(el => observer.observe(el));
}

// --- Navbar Scroll Behavior ---
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// --- Particle Ring Animation (Canvas Fallback for Houdini) ---
function initParticleRing() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, centerX, centerY;
  let ringCenterX, ringCenterY;

  // Constants from Antigravity spec (Adjusted for smaller size & fewer quantity)
  let PARTICLE_COUNT = window.innerWidth <= 768 ? 40 : 120; // Reduced quantity on mobile
  const PARTICLE_SIZE = 1;    // Reduced size
  const PARTICLE_MIN_ALPHA = 0.1;
  const PARTICLE_MAX_ALPHA = 1.0;
  const BASE_RING_THICKNESS = 500;

  let particles = [];

  // Track mouse position for interaction
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener('mousemove', (e) => {
    // Only interact if hero section is visible
    if (window.scrollY < window.innerHeight) {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    }
  });

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    centerX = width / 2;
    centerY = height / 2;
    ringCenterX = centerX;
    ringCenterY = centerY;

    const targetCount = width <= 768 ? 40 : 120;
    if (targetCount !== PARTICLE_COUNT && particles.length > 0) {
      PARTICLE_COUNT = targetCount;
      if (particles.length < PARTICLE_COUNT) {
        for (let i = particles.length; i < PARTICLE_COUNT; i++) {
          particles.push(new Particle(i));
        }
      } else if (particles.length > PARTICLE_COUNT) {
        particles.splice(PARTICLE_COUNT);
      }
    }
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor(index) {
      this.index = index;
      this.reset();
    }

    reset() {
      // distribute angle randomly but smoothly
      this.angle = Math.random() * Math.PI * 2;
      // Tight cluster around the cursor
      const baseRadius = 20 + Math.random() * 60;
      this.radius = baseRadius;

      // Speed of orbit
      this.speed = (Math.random() * 0.02 + 0.01) * (Math.random() < 0.5 ? 1 : -1);

      // Depth (z-axis simulation for alpha/size)
      this.z = Math.random() * Math.PI * 2;
      this.zSpeed = Math.random() * 0.01 + 0.005;

      // Store current pos for rendering
      this.x = 0;
      this.y = 0;
    }

    update() {
      this.angle += this.speed;
      this.z += this.zSpeed;

      // Smooth lerp mouse tracking
      mouseX += (targetMouseX - mouseX) * 0.1;
      mouseY += (targetMouseY - mouseY) * 0.1;

      // Base orbital position tracking the mouse directly
      let baseX = mouseX + Math.cos(this.angle) * this.radius;
      let baseY = mouseY + Math.sin(this.angle) * this.radius * 0.6; // Slight tilt

      // Add a slight rubber-band lag to the particles based on mouse movement speed
      const dx = targetMouseX - mouseX;
      const dy = targetMouseY - mouseY;

      this.x = baseX - dx * 0.2;
      this.y = baseY - dy * 0.2;
    }

    draw(ctx) {
      // Calculate alpha based on "z" depth
      const zScale = (Math.sin(this.z) + 1) / 2; // 0 to 1
      const alpha = PARTICLE_MIN_ALPHA + zScale * (PARTICLE_MAX_ALPHA - PARTICLE_MIN_ALPHA);

      // Make particles closer to us slightly larger
      const currentSize = PARTICLE_SIZE * (0.5 + zScale * 1.5);

      ctx.beginPath();
      ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);

      // Warm gradient colors based on index to match bg image
      const colors = [
        `rgba(255, 94, 77, ${alpha})`,   // Red-orange
        `rgba(255, 140, 66, ${alpha})`,  // Orange
        `rgba(255, 204, 92, ${alpha})`   // Yellow
      ];
      ctx.fillStyle = colors[this.index % colors.length];

      ctx.fill();
    }
  }

  // Initialize
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(i));
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });
    requestAnimationFrame(render);
  }

  render();
}
