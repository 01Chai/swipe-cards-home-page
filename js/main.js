/* Portrait 3D carousel
   - builds cards + clones for smooth infinite loop
   - shows exactly 3 portrait cards at a time (center is active)
   - center card fades/zooms into full-screen background
   - supports pointer drag (mouse/touch), click-to-jump, keyboard, autoplay
*/

/* ========== DATA (replace with your AI images later) ========== */
const cars = [
  { name: "Lamborghini Aventador", desc: "V12 power meets timeless design. The Aventador defines pure performance.", img: "https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1600" },
  { name: "Lamborghini Huracán",   desc: "Compact, fierce, and precision engineered for heart-pounding control.", img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1600" },
  { name: "Lamborghini Urus",      desc: "The world’s first Super SUV — merging luxury, space, and speed.", img: "https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1600" },
  { name: "Lamborghini Gallardo",  desc: "A timeless classic that redefined the modern supercar era.", img: "https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1600" },
  { name: "Lamborghini Revuelto",  desc: "A futuristic hybrid V12 redefining luxury performance.", img: "https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1600" }
];

/* ========== CONFIG & DOM ========== */
const track = document.getElementById('track');
const bg = document.getElementById('bg');
const titleEl = document.getElementById('carTitle');
const descEl = document.getElementById('carDesc');
const rentBtn = document.getElementById('rentBtn');

const CARD_WIDTH = 160;
const GAP = 20;
const STEP = CARD_WIDTH + GAP;
const VIEWPORT_WIDTH = CARD_WIDTH * 3 + GAP * 2; // 520

let index = 1;             // start index in track (after cloning): 1 => first real card
let isDragging = false;
let startX = 0;
let deltaX = 0;
let autoplayTimer = null;
const AUTOPLAY_MS = 4800;

/* ========== BUILD: insert clones + cards into track ========== */
function buildTrack() {
  track.innerHTML = '';

  // clone last (for seamless prev)
  const cloneLast = makeCardElement(cars[cars.length - 1], true);
  track.appendChild(cloneLast);

  // real cards
  cars.forEach(c => {
    const el = makeCardElement(c, false);
    track.appendChild(el);
  });

  // clone first (for seamless next)
  const cloneFirst = makeCardElement(cars[0], true);
  track.appendChild(cloneFirst);
}

function makeCardElement(car, isClone) {
  const el = document.createElement('div');
  el.className = 'card' + (isClone ? ' clone' : '');
  el.dataset.clone = isClone ? '1' : '0';
  el.innerHTML = `<img src="${car.img}" alt="${car.name}"/><div class="label">${car.name}</div>`;
  // click to jump
  el.addEventListener('click', () => {
    // compute real index (index in cars array)
    // track children: [cloneLast, ...real..., cloneFirst]
    const all = Array.from(track.children);
    const clickedIndex = all.indexOf(el);
    // if clicked on clone, translate to corresponding real later via logic
    jumpTo(clickedIndex);
    resetAutoplay();
  });
  return el;
}

/* ========== HELPERS ========== */
function getTranslateXForIndex(i) {
  // we want card at track child index i to sit centered in the viewport area but flush to the right:
  // desiredLeft = VIEWPORT_WIDTH - CARD_WIDTH (make active card stick to right within viewport)
  const desiredLeft = VIEWPORT_WIDTH - CARD_WIDTH;
  return -(i * STEP - desiredLeft);
}

function setTrackTransform(x, withTransition = true) {
  track.style.transition = withTransition ? 'transform .6s cubic-bezier(.22,.9,.32,1)' : 'none';
  track.style.transform = `translateX(${x}px)`;
}

/* ========== UPDATE visuals: active, neighbor classes, background, text ========== */
function updateVisuals() {
  // normalize index within track children
  const children = Array.from(track.children);
  // mark classes
  children.forEach(el => el.classList.remove('active', 'left', 'right'));
  const activeEl = children[index];
  if (activeEl) activeEl.classList.add('active');
  // mark left and right neighbors
  const leftEl = children[index - 1];
  const rightEl = children[index + 1];
  if (leftEl) leftEl.classList.add('left');
  if (rightEl) rightEl.classList.add('right');

  // update background smoothly (fade+zoom)
  const realIndex = (index - 1 + cars.length) % cars.length; // maps track index to cars array
  fadeToBackground(cars[realIndex].img);

  // update text with staggered animation
  titleEl.style.animation = 'none';
  descEl.style.animation = 'none';
  rentBtn.style.animation = 'none';

  titleEl.textContent = cars[realIndex].name;
  descEl.textContent = cars[realIndex].desc;

  // trigger fadeUp with tiny delay so CSS applies
  setTimeout(() => {
    titleEl.style.animation = 'fadeUp 700ms forwards';
    descEl.style.animation = 'fadeUp 700ms 160ms forwards';
    rentBtn.style.animation = 'fadeUp 700ms 320ms forwards';
  }, 40);
}

/* smooth background swap */
function fadeToBackground(url) {
  // fade out
  bg.style.opacity = 0;
  setTimeout(() => {
    bg.style.backgroundImage = `url(${url})`;
    bg.style.transform = 'scale(1.04)';
    bg.style.opacity = 1;
    // return scale to normal slowly
    setTimeout(() => { bg.style.transform = 'scale(1)'; }, 900);
  }, 300);
}

/* ========== NAVIGATION: next / prev / jump / loop handling ========== */
function next() {
  index++;
  setTrackTransform(getTranslateXForIndex(index), true);
  handleLoopAfterTransition();
}

function prev() {
  index--;
  setTrackTransform(getTranslateXForIndex(index), true);
  handleLoopAfterTransition();
}

function jumpTo(trackChildIndex) {
  // set index to clicked element's index in track
  index = trackChildIndex;
  setTrackTransform(getTranslateXForIndex(index), true);
  handleLoopAfterTransition();
}

/* If we hit clones, snap to the real counterpart without visible jump */
function handleLoopAfterTransition() {
  // wait for transition to end
  const onTransitionEnd = () => {
    track.removeEventListener('transitionend', onTransitionEnd);
    const children = Array.from(track.children);
    const firstRealIndex = 1;
    const lastRealIndex = cars.length;
    if (index === 0) {
      // jumped to cloneLast -> snap to last real
      index = lastRealIndex;
      setTrackTransform(getTranslateXForIndex(index), false);
    } else if (index === children.length - 1) {
      // jumped to cloneFirst -> snap to first real
      index = firstRealIndex;
      setTrackTransform(getTranslateXForIndex(index), false);
    }
    updateVisuals();
  };
  track.addEventListener('transitionend', onTransitionEnd);
  // optimistic update of visuals to immediate state (active classes will update after possible snap)
  updateVisuals();
}

/* ========== DRAG / POINTER support ========== */
function onPointerDown(e) {
  isDragging = true;
  startX = e.clientX;
  deltaX = 0;
  track.style.transition = 'none';
  // pause autoplay while interacting
  pauseAutoplay();
}
function onPointerMove(e) {
  if (!isDragging) return;
  deltaX = e.clientX - startX;
  const current = getTranslateXForIndex(index);
  setTrackTransform(current + deltaX, false);
}
function onPointerUp(e) {
  if (!isDragging) return;
  isDragging = false;
  // determine swipe threshold
  if (Math.abs(deltaX) > 60) {
    if (deltaX < 0) next();
    else prev();
  } else {
    // small movement -> snap back
    setTrackTransform(getTranslateXForIndex(index), true);
  }
  deltaX = 0;
  resetAutoplay();
}

/* ========== AUTOPLAY (smooth loop) ========== */
function startAutoplay() {
  stopAutoplay();
  autoplayTimer = setInterval(() => {
    next();
  }, AUTOPLAY_MS);
}
function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
function pauseAutoplay() { stopAutoplay(); }
function resetAutoplay() { stopAutoplay(); startAutoplay(); }

/* ========== INIT ========== */
function init() {
  buildTrack();
  // set initial translate to first real card (track child index 1)
  index = 1;
  setTrackTransform(getTranslateXForIndex(index), false);
  updateVisuals();
  // pointer events on track for dragging
  track.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  // pause autoplay on hover (desktop)
  const viewport = document.querySelector('.gallery-viewport');
  viewport.addEventListener('mouseenter', pauseAutoplay);
  viewport.addEventListener('mouseleave', resetAutoplay);
  // keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
    if (e.key === 'ArrowLeft')  { prev(); resetAutoplay(); }
  });
  // start autoplay
  startAutoplay();
  // recompute on resize
  window.addEventListener('resize', () => {
    setTrackTransform(getTranslateXForIndex(index), false);
  });
}

/* run it */
init();
