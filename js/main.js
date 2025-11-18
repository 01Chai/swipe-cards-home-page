/* Portrait 3D carousel - fixed & polished
   - main card sits LEFT
   - when swiped, the active (left) card visually expands to become background
   - overlay technique used to avoid DOM-jumps
   - smooth infinite looping (clones + snap) with no visible jump
   - text reveal synced after the visual transition
*/

/* ========== DATA ========== */
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
const galleryViewport = document.querySelector('.gallery-viewport');

const CARD_WIDTH = 160;
const GAP = 20;
const STEP = CARD_WIDTH + GAP;
const VIEWPORT_WIDTH = CARD_WIDTH * 3 + GAP * 2; // 520

let index = 1;             // track child index (we'll keep clone at 0)
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
    const all = Array.from(track.children);
    const clickedIndex = all.indexOf(el);
    jumpTo(clickedIndex);
    resetAutoplay();
  });
  return el;
}

/* ========== HELPERS ========== */
/* Align the active card to the LEFT inside the viewport (desiredLeft = 0) */
function getTranslateXForIndex(i) {
  const desiredLeft = 0; // <<<<<< active card sits at left edge of the viewport
  return -(i * STEP - desiredLeft);
}

function setTrackTransform(x, withTransition = true) {
  track.style.transition = withTransition ? 'transform .6s cubic-bezier(.22,.9,.32,1)' : 'none';
  track.style.transform = `translateX(${x}px)`;
}

/* ========== VISUALS ========== */
function updateVisuals() {
  const children = Array.from(track.children);
  children.forEach(el => el.classList.remove('active', 'left', 'right'));
  const activeEl = children[index];
  if (activeEl) activeEl.classList.add('active');
  const leftEl = children[index - 1];
  const rightEl = children[index + 1];
  if (leftEl) leftEl.classList.add('left');
  if (rightEl) rightEl.classList.add('right');
}

/* update background & text AFTER the main visual transition completes */
function updateBackgroundAndTextAfterDelay() {
  // compute realIndex mapping track child -> cars array
  const realIndex = (index - 1 + cars.length) % cars.length;
  // fade to new background
  fadeToBackground(cars[realIndex].img);
  // update text with staggered animation (start slightly after visual settle)
  titleEl.style.animation = 'none';
  descEl.style.animation = 'none';
  rentBtn.style.animation = 'none';
  titleEl.textContent = cars[realIndex].name;
  descEl.textContent = cars[realIndex].desc;
  setTimeout(() => {
    titleEl.style.animation = 'fadeUp 700ms forwards';
    descEl.style.animation = 'fadeUp 700ms 160ms forwards';
    rentBtn.style.animation = 'fadeUp 700ms 320ms forwards';
  }, 420); // delayed so text doesn't pop before background
}

/* smooth background swap */
function fadeToBackground(url) {
  bg.style.opacity = 0;
  setTimeout(() => {
    bg.style.backgroundImage = `url(${url})`;
    bg.style.transform = 'scale(1.04)';
    bg.style.opacity = 1;
    setTimeout(() => { bg.style.transform = 'scale(1)'; }, 900);
  }, 300);
}

/* ========== CORE: swipe -> visually scale a card into background using overlay ========== */

function createOverlayFromCard(cardEl) {
  // get image src
  const imgEl = cardEl.querySelector('img');
  const src = imgEl ? imgEl.src : null;
  // get rect of card to position overlay exactly
  const rect = cardEl.getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.className = 'becoming-overlay';
  // set background image styling
  overlay.style.backgroundImage = `url(${src})`;
  overlay.style.backgroundSize = 'cover';
  overlay.style.backgroundPosition = 'center';
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.borderRadius = window.getComputedStyle(cardEl).borderRadius || '14px';
  overlay.style.opacity = '1';
  document.body.appendChild(overlay);
  // force layout
  overlay.getBoundingClientRect();
  return overlay;
}

function expandOverlayToViewport(overlay, finalCallback) {
  // add a small class to body to dim UI (optional)
  document.documentElement.classList.add('body-dimming');
  // expand
  requestAnimationFrame(() => {
    overlay.classList.add('expand');
  });
  // when done, call callback
  const onEnd = () => {
    overlay.removeEventListener('transitionend', onEnd);
    document.documentElement.classList.remove('body-dimming');
    finalCallback && finalCallback();
    // remove overlay after tiny delay so background replacement is seamless
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 100);
  };
  overlay.addEventListener('transitionend', onEnd);
}

/* ========== NAVIGATION & loop handling ========== */

function next() {
  // create visual overlay from the active (left) card that will become background
  const children = Array.from(track.children);
  const activeEl = children[index];
  const overlay = createOverlayFromCard(activeEl);

  // start overlay expansion slightly before track moves for smoother perception
  expandOverlayToViewport(overlay, () => {
    // set background to card's image once overlay finished expanding
    const img = activeEl.querySelector('img').src;
    bg.style.opacity = 0;
    setTimeout(() => {
      bg.style.backgroundImage = `url(${img})`;
      bg.style.transform = 'scale(1.04)';
      bg.style.opacity = 1;
      setTimeout(() => { bg.style.transform = 'scale(1)'; }, 900);
    }, 40);
  });

  // move track to next index (so remaining cards slide left)
  index++;
  setTrackTransform(getTranslateXForIndex(index), true);

  // handle loop snapping after transition
  handleLoopAfterTransition();
}

function prev() {
  // similar visual effect if you want prev to become background (optional)
  const children = Array.from(track.children);
  const activeEl = children[index];
  const overlay = createOverlayFromCard(activeEl);

  expandOverlayToViewport(overlay, () => {
    const img = activeEl.querySelector('img').src;
    bg.style.opacity = 0;
    setTimeout(() => {
      bg.style.backgroundImage = `url(${img})`;
      bg.style.transform = 'scale(1.04)';
      bg.style.opacity = 1;
      setTimeout(() => { bg.style.transform = 'scale(1)'; }, 900);
    }, 40);
  });

  index--;
  setTrackTransform(getTranslateXForIndex(index), true);
  handleLoopAfterTransition();
}

function jumpTo(trackChildIndex) {
  // small safeguard
  if (trackChildIndex < 0 || trackChildIndex >= track.children.length) return;
  index = trackChildIndex;
  setTrackTransform(getTranslateXForIndex(index), true);
  handleLoopAfterTransition();
}

/* If we hit clones, snap to the real counterpart WITHOUT visual jump.
   We wait for the track transition to end, then silently reset transform (no transition).
*/
function handleLoopAfterTransition() {
  const onTransitionEnd = () => {
    track.removeEventListener('transitionend', onTransitionEnd);
    const children = Array.from(track.children);
    const firstRealIndex = 1;
    const lastRealIndex = cars.length;
    let snapped = false;

    if (index === 0) {
      index = lastRealIndex;
      setTrackTransform(getTranslateXForIndex(index), false);
      snapped = true;
    } else if (index === children.length - 1) {
      index = firstRealIndex;
      setTrackTransform(getTranslateXForIndex(index), false);
      snapped = true;
    }

    // update card classes (active/left/right) AFTER any snapping
    updateVisuals();

    // update background and text only after the visuals have settled slightly
    // use a short timeout so text doesn't animate while track is still moving
    setTimeout(() => {
      updateBackgroundAndTextAfterDelay();
    }, snapped ? 80 : 220);
  };

  track.addEventListener('transitionend', onTransitionEnd);
  // update visuals optimistically (so classes change immediately while track animates)
  updateVisuals();
}

/* ========== DRAG / POINTER support ========== */
function onPointerDown(e) {
  isDragging = true;
  startX = e.clientX;
  deltaX = 0;
  track.style.transition = 'none';
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
  if (Math.abs(deltaX) > 60) {
    // swipe left -> go next (negative delta)
    if (deltaX < 0) next();
    else prev();
  } else {
    // snap back
    setTrackTransform(getTranslateXForIndex(index), true);
    // after snapping visually, refresh text/background
    handleLoopAfterTransition();
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
  index = 1; // first real item sits at child index 1
  setTrackTransform(getTranslateXForIndex(index), false);
  updateVisuals();
  // pointer events on track for dragging
  track.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  // pause autoplay on hover (desktop)
  galleryViewport.addEventListener('mouseenter', pauseAutoplay);
  galleryViewport.addEventListener('mouseleave', resetAutoplay);
  // keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
    if (e.key === 'ArrowLeft')  { prev(); resetAutoplay(); }
  });
  // initial background and text
  setTimeout(() => { updateBackgroundAndTextAfterDelay(); }, 80);
  // start autoplay
  startAutoplay();
  // recompute on resize
  window.addEventListener('resize', () => {
    setTrackTransform(getTranslateXForIndex(index), false);
  });
}

/* run it */
init();
