// ============================================
// Theme Toggle (Dark Mode)
// ============================================
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }

  toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

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
// Scroll Animations (IntersectionObserver)
// ============================================
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('navbar')?.offsetHeight || 64;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
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

  const openModal = (e) => {
    e.preventDefault();
    modal.setAttribute('aria-hidden', 'false');
    // Close mobile nav if it's open
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    if (navbar && navbar.classList.contains('nav-open')) {
      navbar.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  };

  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
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
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
}

// ============================================
// Case Study Slide-up Overlay (Dribbble-Style)
// ============================================

const CASE_STUDIES = {
  "nexus-banking": {
    title: "Nexus Banking Experience",
    tag: "Mobile App",
    lead: "A complete redesign of the core banking flow, focusing on minimal friction and aesthetic joy.",
    image: "artifacts/projects/project_standard_1781015903362.png",
    content: `
      <h3>The Challenge</h3>
      <p>Traditional banking apps are cluttered with legacy features, confusing navigation, and high cognitive load. For Nexus, we aimed to create a streamlined, modern fintech interface that makes daily financial tasks feel effortless and visually satisfying.</p>
      <img src="artifacts/projects/project_standard_1781015903362.png" alt="Nexus Banking Redesign Screen">
      <h3>The Process</h3>
      <p>We began by mapping out user journeys for the most common tasks: checking balances, sending money, and paying bills. Through iterative user testing, we stripped away secondary clutter and created a simplified navigation paradigm built around a dynamic dashboard.</p>
      <h3>Key Design Decisions</h3>
      <ul>
        <li><strong>Minimal Friction Flows:</strong> Reduced the transfer flow from 5 steps to just 2 steps.</li>
        <li><strong>Sensory Feedback:</strong> Integrated micro-animations and haptic cues to build confidence during transactions.</li>
        <li><strong>Elevated Dark Mode:</strong> Crafted a custom high-contrast dark palette to reduce eye strain.</li>
      </ul>
    `
  },
  "lumina-ui": {
    title: "Lumina UI Kit",
    tag: "Design System",
    lead: "An enterprise-grade component library built for scale, accessibility, and visual harmony.",
    image: "artifacts/projects/project_standard_1781015903362.png",
    content: `
      <h3>The Challenge</h3>
      <p>As enterprise platforms grow, maintaining design consistency across multiple development squads becomes a huge challenge. Lumina was built to bridge the gap between design and engineering with unified design tokens, highly reusable components, and strict accessibility standards.</p>
      <img src="artifacts/projects/project_standard_1781015903362.png" alt="Lumina UI Components">
      <h3>The System</h3>
      <p>Lumina goes beyond simple button and input states. It defines a systemic language of motion, spatial relationships, and accessibility defaults that are baked directly into the React/HTML code components.</p>
      <h3>Key Features</h3>
      <ul>
        <li><strong>Comprehensive Tokens:</strong> Multi-theme support for color, spacing, typography, and depth shadows.</li>
        <li><strong>WCAG 2.1 AA Compliant:</strong> Every component is tested for screen readers and high contrast.</li>
        <li><strong>Fully Documented:</strong> An interactive playground allows developers to prototype layouts in seconds.</li>
      </ul>
    `
  },
  "spatial-interfaces": {
    title: "Spatial Interfaces",
    tag: "Exploration",
    lead: "Exploring immersive 3D interface paradigms for next-gen spatial computing platforms.",
    image: "artifacts/projects/project_compact_1781015914671.png",
    content: `
      <h3>The Challenge</h3>
      <p>With the rise of spatial computing, design is transitioning from flat screens to infinite, three-dimensional spaces. This exploration probes how depth, physical lighting, and hand gestures can be utilized to make spatial layouts intuitive without causing user fatigue.</p>
      <img src="artifacts/projects/project_compact_1781015914671.png" alt="3D Spatial UI Concept">
      <h3>The Experiment</h3>
      <p>Using physical shadows, volumetric lighting, and depth layers, we prototyped responsive menus that float in the user's environment. The key was to ensure the interface reacts dynamically to where the user's gaze is directed, creating a soft focus effect.</p>
      <h3>Findings</h3>
      <ul>
        <li><strong>Depth as Hierarchy:</strong> Utilizing Z-axis distance to stack secondary information layers rather than hiding them.</li>
        <li><strong>Interactive Depth Cues:</strong> Subtle scaling and glow effects when elements are focused or selected.</li>
        <li><strong>Natural Physics:</strong> Incorporating inertia and soft bounces for scrolling in a 3D environment.</li>
      </ul>
    `
  },
  "glassmorphic-os": {
    title: "Glassmorphic OS",
    tag: "Concept",
    lead: "A desktop OS concept built on layered translucency and depth-aware interactions.",
    image: "artifacts/projects/project_compact_1781015914671.png",
    content: `
      <h3>The Challenge</h3>
      <p>Operating systems have oscillated between extreme skeuomorphism and flat design. Glassmorphic OS is a design experiment looking at how ambient background light and frosted glass materials can be used to create spatial desktop layers that feel light, airy, and premium.</p>
      <img src="artifacts/projects/project_compact_1781015914671.png" alt="Glassmorphic OS Screen Design">
      <h3>The Interface</h3>
      <p>Every window is styled with dynamic background blur and subtle border highlights that adapt to the user's wallpaper. Active windows receive a soft glow and drop shadow, making them float above background folders.</p>
      <h3>Key Details</h3>
      <ul>
        <li><strong>Layered Depth:</strong> Dynamic backdrop-filters create depth without flat solid colors.</li>
        <li><strong>Depth-Aware Hover:</strong> Windows cast dynamic shadows based on their virtual distance from the desktop layer.</li>
        <li><strong>Curated Accents:</strong> Minimal color use, utilizing the wallpaper's colors to tint active indicators.</li>
      </ul>
    `
  }
};

function initCaseStudyOverlay() {
  const overlay = document.getElementById('case-study-overlay');
  const container = document.getElementById('case-study-container');
  const backdrop = document.getElementById('case-study-backdrop');
  const closeBtn = document.getElementById('case-study-close');
  const content = document.getElementById('case-study-content');
  const triggers = document.querySelectorAll('[data-case-study]');

  if (!overlay || !container || !backdrop || !closeBtn || !content) return;

  const openOverlay = (caseStudyKey) => {
    const data = CASE_STUDIES[caseStudyKey];
    if (!data) return;

    // Inject header
    const headerText = document.getElementById('case-study-header-text');
    if (headerText) {
      headerText.innerHTML = `
        <h2>${data.title}</h2>
        <span class="case-study-tag">${data.tag}</span>
      `;
    }

    // Inject content
    content.innerHTML = `
      <img src="${data.image}" alt="${data.title}" class="case-study-hero-img">
      <div class="case-study-body">
        ${data.content}
      </div>
    `;

    // Open animations
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('overlay-open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  };

  const closeOverlay = () => {
    overlay.classList.remove('overlay-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock background scroll
    
    // Clear content after animation ends to prevent visual jumps
    setTimeout(() => {
      if (!overlay.classList.contains('overlay-open')) {
        content.innerHTML = '';
        container.scrollTop = 0; // Scroll back to top for next open
      }
    }, 550); // Match transition duration (0.55s)
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const caseStudyKey = trigger.getAttribute('data-case-study');
      openOverlay(caseStudyKey);
    });
  });

  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('overlay-open')) {
      closeOverlay();
    }
  });
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
    // Reveal the dock when scrolled past 80% of the hero section height
    if (window.scrollY > heroHeight * 0.8) {
      dock.classList.add('dock-visible');
    } else {
      dock.classList.remove('dock-visible');
    }
  };

  // Check visibility on load in case the page is already scrolled down
  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });
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
  initThemeToggle();
  initMobileNav();
  initScrollAnimations();
  initSmoothScroll();
  initModal();
  initCaseStudyOverlay();
  initFloatingDockVisibility();
  initProtection();
});
