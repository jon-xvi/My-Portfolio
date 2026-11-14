// Register after the existing ScrollSmoother initialization on DOMContentLoaded.
function initAboutPortraitEntrance() {
  const frame = document.querySelector('.about-portrait-wrap');
  const stage = frame?.querySelector('.about-portrait-stage');
  const portrait = frame?.querySelector('img');
  if (!stage || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  let revealed = false;
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    if (revealed) return;
    let active = true;
    gsap.set(stage, { scale: .4, transformOrigin: '50% 100%' });
    const grow = gsap.to(stage, {
      scale: 1,
      duration: 1.6,
      ease: 'power3.out',
      paused: true,
      onComplete: () => { revealed = true; stage.dataset.revealed = 'true'; }
    });
    ScrollTrigger.create({
      trigger: frame,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        // Avoid spending the entrance animation while the large portrait is decoding.
        portrait.decode().catch(() => {}).then(() => { if (active) grow.play(); });
      }
    });
    return () => { active = false; };
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAboutPortraitEntrance, { once: true });
else initAboutPortraitEntrance();

// The decorative ring turns continuously only while the section is on screen.
(() => {
  const section = document.querySelector('#about');
  if (!section) return;
  let visible = false;
  const sync = () => section.classList.toggle('about-in-view', visible && !document.hidden);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(section);
  document.addEventListener('visibilitychange', sync);
})();
