const cars = [
  { name: 'Lamborghini Aventador', desc: 'V12 power meets timeless design. The Aventador defines pure performance with iconic lines and raw energy.', img: 'https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1600' },
  { name: 'Lamborghini Huracán', desc: 'Compact, fierce, and precision engineered for heart-pounding control.', img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1600' },
  { name: 'Lamborghini Urus', desc: 'The world\'s first Super SUV — merging luxury, space, and speed.', img: 'https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1600' },
  { name: 'Lamborghini Gallardo', desc: 'A timeless classic that redefined the modern supercar era.', img: 'https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1600' },
  { name: 'Lamborghini Revuelto', desc: 'A futuristic hybrid V12 redefining luxury performance.', img: 'https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1600' }
];

const track = document.getElementById('track');
const bg = document.getElementById('bg');
const titleEl = document.getElementById('title');
const descEl = document.getElementById('desc');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

const CARD_WIDTH = 160;
const GAP = 20;
const STEP = CARD_WIDTH + GAP;
let isAnimating = false;
let overlay = null;
let autoplayTimer = null;
const AUTOPLAY_MS = 5000;

function buildTrack() {
  track.innerHTML = '';
  cars.forEach(car => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${car.img}" alt="${car.name}"><div class="label">${car.name}</div>`;
    track.appendChild(card);
  });
  updateActiveClass();
  updateText(cars[0]);
  bg.style.backgroundImage = `url(${cars[0].img})`;
}

function updateActiveClass() {
  Array.from(track.children).forEach((card, index) => {
    card.classList.toggle('active', index === 0);
  });
}

function updateText(car) {
  gsap.to([titleEl, descEl], { opacity: 0, y: 20, duration: 0.3, onComplete: () => {
    titleEl.textContent = car.name;
    descEl.textContent = car.desc;
    gsap.to([titleEl, descEl], { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
  }});
}

function createOverlay(cardEl) {
  if (overlay) overlay.remove();
  const rect = cardEl.getBoundingClientRect();
  overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.left = rect.left + 'px';
  overlay.style.top = rect.top + 'px';
  overlay.style.width = rect.width + 'px';
  overlay.style.height = rect.height + 'px';
  overlay.style.backgroundImage = `url(${cardEl.querySelector('img').src})`;
  document.body.appendChild(overlay);
  overlay.offsetHeight; // Force reflow
  return overlay;
}

function goNext() {
  if (isAnimating) return;
  isAnimating = true;
  clearInterval(autoplayTimer);

  const leavingCard = track.children[0];
  const ov = createOverlay(leavingCard);

  const tl = gsap.timeline({ onComplete: () => {
    cars.push(cars.shift());
    track.appendChild(track.children[0]);
    gsap.set(track, { x: 0 });
    updateActiveClass();
    updateText(cars[0]);
    bg.style.backgroundImage = `url(${cars[0].img})`;
    if (overlay) overlay.remove();
    overlay = null;
    isAnimating = false;
    autoplayTimer = setInterval(goNext, AUTOPLAY_MS);
  }});

  tl.to(track, { x: -STEP, duration: 0.8, ease: 'power3.out' }, 0);
  tl.to(ov, { 
    left: 0, 
    top: 0, 
    width: '100vw', 
    height: '100vh', 
    borderRadius: 0, 
    duration: 1.0, 
    ease: 'power3.inOut' 
  }, 0);
}

function goPrev() {
  if (isAnimating) return;
  isAnimating = true;
  clearInterval(autoplayTimer);

  // Move last card to front
  const lastCard = track.lastElementChild;
  track.insertBefore(lastCard, track.firstElementChild);
  gsap.set(track, { x: -STEP });

  const leavingCard = track.children[0];
  const ov = createOverlay(leavingCard);

  const tl = gsap.timeline({ onComplete: () => {
    cars.unshift(cars.pop());
    track.appendChild(track.children[0]);
    gsap.set(track, { x: 0 });
    updateActiveClass();
    updateText(cars[0]);
    bg.style.backgroundImage = `url(${cars[0].img})`;
    if (overlay) overlay.remove();
    overlay = null;
    isAnimating = false;
    autoplayTimer = setInterval(goNext, AUTOPLAY_MS);
  }});

  tl.to(track, { x: 0, duration: 0.8, ease: 'power3.out' }, 0);
  tl.to(ov, { 
    left: 0, 
    top: 0, 
    width: '100vw', 
    height: '100vh', 
    borderRadius: 0, 
    duration: 1.0, 
    ease: 'power3.inOut' 
  }, 0);
}

prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
});

// Init
buildTrack();
autoplayTimer = setInterval(goNext, AUTOPLAY_MS);
