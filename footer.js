// Animation adapted from the supplied Doodle Crew storyboard, using the site's GSAP.
(() => {
  const footer = document.querySelector('.sketch-footer');
  if (!footer || !window.gsap) return;
  const svg = footer.querySelector('.footer-illustration');
  const ns = 'http://www.w3.org/2000/svg';
  const letters = [...footer.querySelectorAll('.footer-letter')];
  const arts = [...footer.querySelectorAll('.footer-crew-art')];
  const pupils = [...footer.querySelectorAll('.footer-pupil')];
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const crew = {
    yeti: { name: 'Bruno', seat: 'front', says: 'Hungry. Got snacks?', x: 145, y: 350, w: 150, h: 160 },
    bird: { name: 'Pip', seat: 'top', says: 'Tweet us! Seriously.', x: 375, y: 230, w: 100, h: 100 },
    mushroom: { name: 'Morel', seat: 'front', says: "I'm a fun guy.", x: 515, y: 409, w: 70, h: 70 },
    kid: { name: 'Juno', seat: 'top', says: 'Up here! Best seat in the house.', x: 845, y: 222, w: 100, h: 170 },
    ghost: { name: 'Boo', seat: 'behind', says: 'Boo! …sorry. Hi.', x: 1125, y: 253, w: 90, h: 85 },
    cat: { name: 'Patch', seat: 'front', says: 'Arr. Nice cursor.', x: 1350, y: 370, w: 100, h: 135 }
  };
  const wrap = (node, className) => {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', className);
    node.parentNode.insertBefore(g, node);
    g.appendChild(node);
    return g;
  };
  arts.forEach(art => {
    wrap(wrap(wrap(art, 'footer-idle'), 'footer-hop'), 'footer-arrival');
    art.parentNode.dataset.kind = art.dataset.crew;
    art.parentNode.style.setProperty('--idle-delay', `${Object.keys(crew).indexOf(art.dataset.crew) * -.7}s`);
  });
  pupils.forEach(pupil => {
    const eye = pupil.firstElementChild;
    const ring = pupil.previousElementSibling;
    const blink = wrap(pupil, 'footer-eye-blink');
    if (ring?.tagName === 'circle' && ring.getAttribute('cx') === eye.getAttribute('cx') && ring.getAttribute('cy') === eye.getAttribute('cy')) blink.prepend(ring);
    blink.style.setProperty('--blink-delay', `${Object.keys(crew).indexOf(pupil.closest('[data-crew]').dataset.crew) * -.63}s`);
  });
  const doodles = [...footer.querySelector('.footer-doodles').children].map((node, i) => {
    const match = node.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
    const mover = wrap(node, 'footer-doodle-mover');
    const initial = { x: +match[1], y: +match[2] };
    return { node, mover, initial, x: initial.x, y: initial.y, vx: 0, vy: 0, speed: 15 + i * 3, phase: i * 1.7, pop: 0, angle: 0 };
  });
  const controls = document.createElement('div');
  controls.className = 'footer-crew-controls';
  controls.hidden = true;
  const buttons = Object.entries(crew).map(([kind, info]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'footer-crew-button';
    button.dataset.kind = kind;
    button.setAttribute('aria-label', `Make ${info.name} the ${kind} hop`);
    button.style.cssText = `left:${info.x / 14.4}%;top:${info.y / 4.38}%;width:${info.w / 14.4}%;height:${info.h / 4.38}%;`;
    controls.appendChild(button);
    return button;
  });
  footer.appendChild(controls);
  const bubble = document.createElement('div');
  bubble.className = 'footer-speech';
  bubble.setAttribute('role', 'status');
  bubble.hidden = true;
  footer.appendChild(bubble);
  let inView = false;
  let syncMotion = () => {};
  const observer = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    syncMotion();
  }, { threshold: .05 });
  observer.observe(footer);
  document.addEventListener('visibilitychange', () => syncMotion());

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const arrivals = arts.map(art => art.closest('.footer-arrival'));
    const top = [...footer.querySelector('.sketch-footer-top').children];
    const animations = new Set();
    const events = new AbortController();
    let raf = 0, last = 0, elapsed = 0, lastInk = 0, bubbleTimer = 0;
    let pointer = null, introComplete = false, running = false;
    footer.classList.add('footer-motion-ready');
    controls.hidden = false;
    gsap.set(letters, { autoAlpha: 0, y: -65, scale: 1.2, transformOrigin: '50% 100%' });
    gsap.set(arrivals, { autoAlpha: 0, transformOrigin: '50% 100%' });
    gsap.set(top, { autoAlpha: 0, y: 14 });
    gsap.set(doodles.map(d => d.mover), { opacity: 0 });
    const intro = gsap.timeline({ paused: true, onComplete: () => { introComplete = true; footer.dataset.intro = 'complete'; } });
    letters.forEach((letter, i) => {
      const at = i * .085;
      intro.to(letter, { autoAlpha: 1, y: 0, scaleX: .96, scaleY: 1.05, duration: .36, ease: 'power2.in' }, at)
        .to(letter, { scaleX: 1.025, scaleY: .97, duration: .13 }, at + .36)
        .to(letter, { scale: 1, duration: .2, ease: 'power2.out' }, at + .49);
    });
    arrivals.forEach((arrival, i) => {
      const info = crew[arts[i].dataset.crew];
      const order = Object.keys(crew).indexOf(arts[i].dataset.crew);
      intro.fromTo(arrival, { y: info.seat === 'top' ? -90 : 50, scaleY: info.seat === 'front' ? .4 : 1 },
        { autoAlpha: 1, y: 0, scaleY: 1, duration: .85, ease: info.seat === 'top' ? 'bounce.out' : 'back.out(1.7)' }, .65 + order * .13);
    });
    intro.to(doodles.map(d => d.mover), { opacity: 1, duration: .5, stagger: .1 }, 1.3)
      .to(top, { autoAlpha: 1, y: 0, duration: .6, stagger: .1, ease: 'power2.out' }, 1.65);

    const track = animation => {
      animations.add(animation);
      animation.eventCallback('onComplete', () => animations.delete(animation));
      return animation;
    };
    const resetEyes = () => pupils.forEach(p => p.removeAttribute('transform'));
    const hideBubble = () => { clearTimeout(bubbleTimer); bubble.hidden = true; };
    const showBubble = (kind, button) => {
      const info = crew[kind];
      const b = button.getBoundingClientRect(), f = footer.getBoundingClientRect();
      bubble.textContent = info.says;
      bubble.hidden = false;
      bubble.style.left = `${Math.max(12, Math.min(f.width - bubble.offsetWidth - 12, b.x - f.x + b.width / 2 - bubble.offsetWidth / 2))}px`;
      bubble.style.top = `${Math.max(10, b.y - f.y - bubble.offsetHeight - 10)}px`;
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(hideBubble, 2200);
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      if (!running || !introComplete) return;
      const hops = arts.filter(a => a.dataset.crew === button.dataset.kind).map(a => a.closest('.footer-hop'));
      gsap.killTweensOf(hops);
      track(gsap.timeline().to(hops, { scaleX: 1.12, scaleY: .84, duration: .12, transformOrigin: '50% 100%' })
        .to(hops, { y: -30, scaleX: .94, scaleY: 1.08, duration: .2, ease: 'power2.out' })
        .to(hops, { y: 0, scaleX: 1.1, scaleY: .88, duration: .2, ease: 'power2.in' })
        .to(hops, { scale: 1, duration: .18, ease: 'back.out(2)' }));
      showBubble(button.dataset.kind, button);
    }, { signal: events.signal }));
    letters.forEach(letter => letter.addEventListener('pointerenter', () => {
      if (!running || !introComplete || !finePointer.matches) return;
      const glyph = letter.querySelector('.footer-glyph');
      gsap.killTweensOf(glyph);
      track(gsap.timeline().to(glyph, { rotation: -4, scaleX: 1.03, scaleY: .97, duration: .14, transformOrigin: '50% 100%' })
        .to(glyph, { rotation: 3, y: -5, duration: .14 })
        .to(glyph, { rotation: -1.5, y: 0, duration: .14 })
        .to(glyph, { rotation: 0, scale: 1, duration: .18 }));
    }, { signal: events.signal }));
    doodles.forEach(d => d.node.addEventListener('pointerdown', () => {
      if (running && introComplete) d.pop = 1;
    }, { signal: events.signal }));
    footer.addEventListener('pointermove', e => {
      if (!running || !finePointer.matches) return;
      const matrix = svg.getScreenCTM();
      if (matrix) pointer = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
      const offsets = pupils.map(p => {
        const eye = p.firstElementChild, m = eye.getScreenCTM();
        if (!m) return { x: 0, y: 0 };
        const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        const dx = point.x - eye.cx.baseVal.value, dy = point.y - eye.cy.baseVal.value;
        const length = Math.hypot(dx, dy), amount = Math.min(1.8, length / 45);
        return { x: length ? dx / length * amount : 0, y: length ? dy / length * amount : 0 };
      });
      pupils.forEach((p, i) => p.setAttribute('transform', `translate(${offsets[i].x} ${offsets[i].y})`));
    }, { passive: true, signal: events.signal });
    footer.addEventListener('pointerleave', () => { pointer = null; resetEyes(); }, { signal: events.signal });

    const turbulence = footer.querySelector('#footer-sketch feTurbulence');
    const loop = time => {
      if (!running) return;
      const dt = last ? Math.min((time - last) / 1000, .05) : 0;
      last = time; elapsed += dt;
      if (introComplete) {
        doodles.forEach((d, i) => {
          if (d.pop > 0) {
            d.pop -= dt;
            d.mover.style.opacity = String(Math.max(0, (d.pop - .75) * 4));
            if (d.pop <= 0) { d.y = -22; d.x = 80 + ((d.x * 1.73 + i * 193) % 1280); d.mover.style.opacity = '1'; }
          } else {
            if (pointer) {
              const dx = d.x - pointer.x, dy = d.y - pointer.y, length = Math.hypot(dx, dy);
              if (length < 75 && length > .01) {
                d.vx += dx / length * (75 - length) * dt * 6;
                d.vy += dy / length * (75 - length) * dt * 6;
              }
            }
            d.vx *= Math.exp(-dt * 3); d.vy *= Math.exp(-dt * 3);
            d.x += (Math.sin(elapsed * .7 + d.phase) * 9 + d.vx) * dt;
            d.y += (d.speed + d.vy) * dt;
            if (d.y > 462) { d.y = -22; d.x = 80 + ((d.x * 1.73 + i * 193) % 1280); }
            if (d.x < -25) d.x = 1460;
            if (d.x > 1465) d.x = -20;
          }
          d.mover.setAttribute('transform', `translate(${(d.x - d.initial.x).toFixed(2)} ${(d.y - d.initial.y).toFixed(2)})`);
        });
        // A low-frequency change gives the outlines the supplied hand-drawn "boil".
        if (elapsed - lastInk > .18) { turbulence.setAttribute('seed', String(3 + Math.floor(elapsed / .18) % 3 * 7)); lastInk = elapsed; }
      }
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      running = inView && !document.hidden;
      footer.classList.toggle('footer-animating', running);
      footer.dataset.motion = running ? 'running' : 'paused';
      controls.hidden = false;
      if (running) { intro.play(); animations.forEach(a => a.resume()); if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }
      else { intro.pause(); animations.forEach(a => a.pause()); cancelAnimationFrame(raf); raf = 0; pointer = null; resetEyes(); hideBubble(); }
    };
    syncMotion = sync;
    sync();
    return () => {
      syncMotion = () => {};
      events.abort(); cancelAnimationFrame(raf); hideBubble(); resetEyes();
      intro.kill(); animations.forEach(a => a.kill());
      footer.classList.remove('footer-motion-ready', 'footer-animating');
      footer.dataset.motion = 'reduced';
      delete footer.dataset.intro;
      controls.hidden = true;
      turbulence.setAttribute('seed', '3');
      doodles.forEach(d => { d.mover.removeAttribute('transform'); d.mover.style.opacity = ''; d.x = d.initial.x; d.y = d.initial.y; d.vx = d.vy = d.pop = 0; });
      gsap.set([...letters, ...arrivals, ...top, ...doodles.map(d => d.mover), ...footer.querySelectorAll('.footer-hop,.footer-glyph')], { clearProps: 'all' });
    };
  });
})();
