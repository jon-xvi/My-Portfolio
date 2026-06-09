document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollAnimations();
  initParticleRing();
  initNavbar();
});

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
  
  // Constants from Antigravity spec
  const PARTICLE_COUNT = 80;
  const PARTICLE_ROWS = 25;
  const PARTICLE_SIZE = 2;
  const PARTICLE_MIN_ALPHA = 0.1;
  const PARTICLE_MAX_ALPHA = 1.0;
  const BASE_RING_THICKNESS = 600;
  
  let particles = [];
  let time = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    centerX = width / 2;
    centerY = height / 2;
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
      // distance from center (orbit radius)
      // Base radius depends on screen size, thickness is distributed
      const baseRadius = Math.min(width, height) * 0.35;
      this.radius = baseRadius + (Math.random() - 0.5) * BASE_RING_THICKNESS * (width > 768 ? 1 : 0.5);
      
      // Speed of orbit
      this.speed = (Math.random() * 0.001 + 0.0005) * (Math.random() < 0.5 ? 1 : -1);
      
      // Depth (z-axis simulation for alpha/size)
      this.z = Math.random() * Math.PI * 2;
      this.zSpeed = Math.random() * 0.01 + 0.005;
    }

    update() {
      this.angle += this.speed;
      this.z += this.zSpeed;
    }

    draw(ctx) {
      const x = centerX + Math.cos(this.angle) * this.radius;
      
      // Create a tilt effect by scaling the Y axis
      const tilt = 0.4; // 3D tilt
      const y = centerY + Math.sin(this.angle) * this.radius * tilt;

      // Calculate alpha based on "z" depth
      const zScale = (Math.sin(this.z) + 1) / 2; // 0 to 1
      const alpha = PARTICLE_MIN_ALPHA + zScale * (PARTICLE_MAX_ALPHA - PARTICLE_MIN_ALPHA);
      
      // Make particles closer to us slightly larger
      const currentSize = PARTICLE_SIZE * (0.5 + zScale * 1.5);

      ctx.beginPath();
      ctx.arc(x, y, currentSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 128, ${alpha})`; // Navy: #000080
      ctx.fill();
    }
  }

  // Initialize
  for (let i = 0; i < PARTICLE_COUNT * PARTICLE_ROWS / 5; i++) { // Using slightly fewer for performance, but giving the dense feel
    particles.push(new Particle(i));
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    
    // Slow rotation of the whole canvas could be applied, but updating particles gives more 3D feel
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    requestAnimationFrame(render);
  }

  render();
}
