document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  // Fetch projects from the JSON "database"
  fetch('projects.json')
    .then(res => res.json())
    .then(projects => {
      renderProjects(projects);
    })
    .catch(err => console.error('Error loading projects:', err));

  function renderProjects(projects) {
    grid.innerHTML = ''; // Clear out the loading state or old hardcoded content

    projects.forEach((project, index) => {
      const card = document.createElement('a');
      card.href = '#';
      card.className = 'project-card animate-on-scroll';
      card.dataset.caseStudy = project.id;
      // Stagger animations slightly if we want
      card.style.animationDelay = `${index * 0.1}s`;

      // Check if cover media is a video
      let mediaHtml = '';
      if (project.coverMedia.match(/\.(mp4|webm)$/i)) {
        mediaHtml = `<video src="${project.coverMedia}" autoplay loop muted playsinline class="project-img"></video>`;
      } else {
        mediaHtml = `<img src="${project.coverMedia}" alt="${project.title}" class="project-img">`;
      }

      card.innerHTML = `
        <div class="project-img-wrap">
          ${mediaHtml}
        </div>
        <div class="project-info">
          <span class="project-tag">${project.tag}</span>
          <h3>${project.title} <span class="arrow-icon">↗</span></h3>
          <p>${project.lead}</p>
        </div>
      `;

      grid.appendChild(card);

      // Attach click event for the modal
      card.addEventListener('click', (e) => {
        e.preventDefault();
        openCaseStudy(project);
      });
    });

    // We must manually trigger intersection observers for our new elements 
    // since the original main.js ran before these were added.
    observeNewCards(grid.querySelectorAll('.animate-on-scroll'));
  }

  function openCaseStudy(project) {
    const overlay = document.getElementById('case-study-overlay');
    const headerText = document.getElementById('case-study-header-text');
    const content = document.getElementById('case-study-content');

    // 1. Open the modal (matching main.js logic)
    overlay.classList.add('overlay-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // 2. Set the sticky header
    headerText.innerHTML = `
      <h2>${project.title}</h2>
      <span class="case-study-tag">${project.tag}</span>
    `;

    // 3. Set a loading state
    let heroHtml = '';
    if (project.coverMedia.match(/\.(mp4|webm)$/i)) {
      heroHtml = `<video src="${project.coverMedia}" autoplay loop muted playsinline class="case-study-hero-img"></video>`;
    } else {
      heroHtml = `<img src="${project.coverMedia}" alt="${project.title}" class="case-study-hero-img">`;
    }

    content.innerHTML = `
      ${heroHtml}
      <div class="case-study-body">
        <p>Loading case study...</p>
      </div>
    `;

    // 4. Fetch the markdown file
    fetch(`case_studies/${project.id}.md`)
      .then(res => {
        if (!res.ok) throw new Error('Markdown file not found');
        return res.text();
      })
      .then(markdown => {
        // Parse the markdown using the marked.js library included in index.html
        const htmlContent = marked.parse(markdown);
        content.innerHTML = `
          ${heroHtml}
          <div class="case-study-body">
            ${htmlContent}
          </div>
        `;
      })
      .catch(err => {
        console.error(err);
        content.innerHTML = `
          ${heroHtml}
          <div class="case-study-body">
            <p>Could not load the case study content. Make sure <code>case_studies/${project.id}.md</code> exists.</p>
          </div>
        `;
      });
  }

  function observeNewCards(elements) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }
});
