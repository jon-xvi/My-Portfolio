// ============================================
// Theme Toggle (Dark Mode)
// ============================================
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const mobileToggle = document.getElementById('theme-toggle-mobile');
  const themeLabelEl = document.querySelector('.theme-label-text');

  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }

  // Keep the mobile label in sync with current theme
  function updateMobileLabel() {
    if (themeLabelEl) {
      const isDark = document.documentElement.classList.contains('dark');
      themeLabelEl.textContent = isDark ? 'light' : 'dark';
    }
  }

  // Set initial label
  updateMobileLabel();

  function applyToggle() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateMobileLabel();
  }

  if (toggle) toggle.addEventListener('click', applyToggle);
  if (mobileToggle) mobileToggle.addEventListener('click', applyToggle);
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
  "maildrip-redesign": {
    title: "MailDrip Opt-In Forms Redesign",
    tag: "UX/UI Design",
    lead: "A complete UX and UI redesign of MailDrip's opt-in forms, shifting from a complex page-builder to a simple, goal-driven workflow.",
    image: "artifacts/opt-in-case-study/Opt-in-video-1783520930106.gif",
    content: `<h3>Overview</h3><p>MailDrip's Opt-In Pages feature was designed to help users collect leads, grow their audience, and capture customer information. Despite being a core growth feature, adoption remained low and users frequently abandoned the creation flow before publishing a form.</p><p>The objective of this redesign was to improve both the user experience and visual experience by simplifying the workflow, reducing friction, and creating a modern interface that encouraged users to complete and publish forms confidently.</p><div class="gallery-wrapper"><div class="gallery-track"><button class="gallery-arrow gallery-arrow-left" aria-label="Previous image" onclick="const g=this.nextElementSibling; g.scrollBy({left:-(g.querySelector('img').offsetWidth+16),behavior:'smooth'})"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button><div class="horizontal-scroll-gallery" onscroll="const d=this.parentElement.nextElementSibling.children; const m=this.scrollWidth-this.clientWidth; const i=m>0?Math.round((this.scrollLeft/m)*(d.length-1)):0; Array.from(d).forEach((x,j)=>x.className=j===i?'dot active':'dot')"><img src="artifacts/opt-in-case-study/PS%201.png" alt="Problem State 1" loading="lazy" decoding="async"><img src="artifacts/opt-in-case-study/PS%202.png" alt="Problem State 2" loading="lazy" decoding="async"><img src="artifacts/opt-in-case-study/PS%203.png" alt="Problem State 3" loading="lazy" decoding="async"></div><button class="gallery-arrow gallery-arrow-right" aria-label="Next image" onclick="const g=this.previousElementSibling; g.scrollBy({left:g.querySelector('img').offsetWidth+16,behavior:'smooth'})"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button></div><div class="gallery-dots"><div class="dot active"></div><div class="dot"></div><div class="dot"></div></div></div><h3>The Problem</h3><p>After auditing the existing product and reviewing user behaviour, it became clear that the feature suffered from both UX and UI issues.</p><h4>UX Problems</h4><ul><li><strong>Complex Mental Model:</strong> The feature was built around creating complete "Opt-In Pages" rather than simple lead-capture forms. Many users only wanted to collect emails or registrations, yet the workflow forced them into a page-building experience that felt unnecessarily complicated.</li><li><strong>Marketing Jargon:</strong> Terms such as Opt-In Pages, Lead Magnets, and Conversion Funnels created confusion, especially for creators and small business owners who were focused on outcomes rather than marketing terminology.</li><li><strong>High Cognitive Load:</strong> Users were required to make multiple configuration decisions before seeing value. Starting from a blank canvas increased friction and contributed to workflow abandonment.</li></ul><h4>UI Problems</h4><ul><li><strong>Poor Visual Hierarchy:</strong> Important actions competed for attention, making it difficult for users to understand where to start or what to do next. Primary and secondary actions lacked clear distinction, increasing decision fatigue.</li><li><strong>Outdated Interface Design:</strong> The interface felt visually dense and dated. Large blocks of content, inconsistent spacing, and crowded layouts made the experience feel more complicated than it actually was.</li><li><strong>Weak Information Scanning:</strong> Users had to read through multiple sections before understanding available templates and options. The lack of visual grouping made information difficult to scan and process quickly.</li><li><strong>Low Perceived Quality:</strong> The visual design did not reflect the quality expected from a modern SaaS product. This affected user confidence during form creation and reduced the perceived value of the feature.</li></ul><h3>Research Insights</h3><p>Through user feedback and workflow analysis, one insight became obvious: Users were not trying to build pages. They were trying to achieve specific outcomes.</p><p>Their goals were simple: Grow an audience, Capture leads, Collect registrations, Promote an event.</p><p>This insight became the foundation for both the UX and UI redesign.</p><h3>Design Strategy</h3><p>The redesign focused on two parallel objectives:</p><ol><li><strong>Simplify the Experience:</strong> Move from a page-centric workflow to an intent-driven workflow.</li><li><strong>Modernize the Interface:</strong> Create a cleaner, more structured visual system that improved clarity, usability, and trust.</li></ol><h3>Key Design Decisions</h3><ul><li><strong>Reframing "Opt-In Pages" as "Opt-In Forms":</strong> The feature was renamed to better match user expectations. Users immediately understood what they were creating, reducing confusion before the workflow even began.</li><li><strong>Goal-Based Entry Points:</strong> Rather than asking users what type of page they wanted to build, the system now asks: "What would you like this form to achieve?" Options included Grow Your Audience, Capture Leads, Promote an Event, and Drive Customer Action. This aligned the product with users' natural thought process.</li><li><strong>AI-Assisted Form Generation:</strong> To eliminate blank-page anxiety, users can describe their objective in plain language. The system automatically generates a recommended structure, fields, and layout based on the intended goal. This significantly reduces setup time while helping users reach value faster.</li><li><strong>Visual System Overhaul:</strong> A complete interface redesign introduced clear visual hierarchy, consistent spacing system, improved typography scale, stronger contrast between actions, better content grouping, and reduced visual clutter. The result was a cleaner experience that required less effort to understand and navigate.</li><li><strong>Redesigned Template Experience:</strong> Templates were reorganized around common user goals instead of technical categories. Each template included clear use-case descriptions, visual previews, and recommended scenarios. This made selection faster and more intuitive.</li></ul><div class="gallery-wrapper"><div class="gallery-track"><button class="gallery-arrow gallery-arrow-left" aria-label="Previous image" onclick="const g=this.nextElementSibling; g.scrollBy({left:-(g.querySelector('img').offsetWidth+16),behavior:'smooth'})"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button><div class="horizontal-scroll-gallery" onscroll="const d=this.parentElement.nextElementSibling.children; const m=this.scrollWidth-this.clientWidth; const i=m>0?Math.round((this.scrollLeft/m)*(d.length-1)):0; Array.from(d).forEach((x,j)=>x.className=j===i?'dot active':'dot')"><img src="artifacts/opt-in-case-study/SO%201.png" alt="Solution Outcome 1" loading="lazy" decoding="async"><img src="artifacts/opt-in-case-study/SO%202.png" alt="Solution Outcome 2" loading="lazy" decoding="async"><img src="artifacts/opt-in-case-study/SO%203.png" alt="Solution Outcome 3" loading="lazy" decoding="async"><img src="artifacts/opt-in-case-study/SO%204.png" alt="Solution Outcome 4" loading="lazy" decoding="async"></div><button class="gallery-arrow gallery-arrow-right" aria-label="Next image" onclick="const g=this.previousElementSibling; g.scrollBy({left:g.querySelector('img').offsetWidth+16,behavior:'smooth'})"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button></div><div class="gallery-dots"><div class="dot active"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div><h3>UX & UI Outcomes</h3><p>The redesigned experience delivered improvements across both usability and aesthetics.</p><ul><li><strong>UX Improvements:</strong> Reduced setup complexity, faster form creation, lower cognitive load, improved workflow completion.</li><li><strong>UI Improvements:</strong> Better visual clarity, faster information scanning, improved accessibility, stronger perceived product quality, increased user confidence.</li></ul><h3>Results</h3><p>Following launch, key product metrics improved significantly.</p><ul><li><strong>Feature Adoption:</strong> 14% to 42% (3x increase)</li><li><strong>Workflow Completion:</strong> 38% to 79% (More than double)</li><li><strong>Form Conversion Rate:</strong> 2.4% to 4.8% (100% increase)</li></ul><h3>Reflection</h3><p>This project demonstrated that poor performance was not caused by workflow complexity alone. The combination of confusing terminology, unnecessary setup steps, and a visually overwhelming interface created friction throughout the experience.</p><p>By redesigning both the user journey and the interface itself, MailDrip's Opt-In Forms evolved from an underutilized feature into a more intuitive, visually polished, and conversion-focused product experience.</p>`
  },
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
    let mediaHTML = '';
    if (data.image.endsWith('.mp4') || data.image.endsWith('.webm')) {
      mediaHTML = `<video src="${data.image}" class="case-study-hero-img" autoplay loop muted playsinline></video>`;
    } else if (data.image.endsWith('.gif')) {
      mediaHTML = `<img src="${data.image}" alt="${data.title}" class="case-study-hero-img case-study-hero-img--square">`;
    } else {
      mediaHTML = `<img src="${data.image}" alt="${data.title}" class="case-study-hero-img">`;
    }

    content.innerHTML = `
      ${mediaHTML}
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
