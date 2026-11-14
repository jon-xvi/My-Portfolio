(() => {
  const details = document.querySelector('.study-contents details');
  const mobile = matchMedia('(max-width: 760px)');
  const syncContents = () => { details.open = !mobile.matches; };
  syncContents();
  mobile.addEventListener('change', syncContents);
  details.querySelector('summary').addEventListener('click', event => {
    if (!mobile.matches) event.preventDefault();
  });
  const links = [...details.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  links.forEach(link => link.addEventListener('click', () => {
    if (mobile.matches) details.open = false;
  }));
  let scheduled = false;
  const updateContents = () => {
    const threshold = mobile.matches ? 156 : 140;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) current = section;
    }
    links.forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateContents); }
  }, { passive: true });
  window.addEventListener('resize', updateContents);
  updateContents();

  const dialog = document.querySelector('.study-lightbox');
  const zoomImage = dialog.querySelector('img');
  document.querySelectorAll('[data-zoom]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      zoomImage.src = link.href;
      zoomImage.alt = link.querySelector('img').alt;
      dialog.showModal();
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
})();
