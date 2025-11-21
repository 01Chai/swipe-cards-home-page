// js/main.js — Final bulletproof infinite carousel (2025)

const cars = [
  { name: "Lamborghini Aventador", desc: "V12 power meets timeless design.", img: "https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1600" },
  { name: "Lamborghini Huracán",   desc: "Compact, fierce, and precision engineered.", img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1600" },
  { name: "Lamborghini Urus",      desc: "The world’s first Super SUV.", img: "https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1600" },
  { name: "Lamborghini Gallardo",  desc: "A timeless classic that redefined the era.", img: "https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1600" },
  { name: "Lamborghini Revuelto",  desc: "Futuristic hybrid V12 luxury performance.", img: "https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1600" }
];

const track = document.getElementById('track');
const bg = document.getElementById('bg');
const titleEl = document.getElementById('carTitle');
const descEl = document.getElementById('carDesc');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const STEP = 180; // 160 + 20 gap
let isAnimating = false;
let currentOverlay = null;
let autoplayTimer = null;
const AUTOPLAY_MS = 5000;

// Build cards
function buildTrack() {
  track.innerHTML = '';
  cars.forEach(car => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${car.img}" alt="${car.name}">
                      <div class="label">${car.name}</div>`;
    // Vanilla Tilt
    card.dataset.tilt = '';
    track.appendChild(card);
  });
  updateCenterGlow();
  updateText();
  bg.style.backgroundImage = `url(${cars[1].img})`;
}

// Center glow
function updateCenterGlow() {
  track.querySelectorAll('.card').forEach((c, i) => {
    c.classList.toggle('center', i === 1);
  });
}

// Text update
function updateText() {
  const car = cars[1];
  titleEl.textContent = car.name;
  descEl.textContent = car.desc;
  gsap.fromTo([titleEl, descEl], {y:20, opacity:0}, {y:0, opacity:1, duration:0.8, stagger:0.1});
}

// Fade background
function fadeBg(url) {
  gsap.to(bg, {opacity:0, duration:0.3, onComplete:()=> {
    bg.style.backgroundImage = `url(${url})`;
    gsap.to(bg, {opacity:1, duration:0.8});
  }});
}

// Create overlay
function createOverlay(cardEl) {
  if (currentOverlay?.isConnected) currentOverlay.remove();
  const r = cardEl.getBoundingClientRect();
  const src = cardEl.querySelector('img').src;
  currentOverlay = document.createElement('div');
  currentOverlay.className = 'becoming-overlay';
  currentOverlay.style.cssText = `background-image:url(${src});left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
  document.body.appendChild(currentOverlay);
  currentOverlay.offsetHeight;
  return currentOverlay;
}

// NEXT → leftmost card explodes
function goNext() {
  if (isAnimating) return;
  isAnimating = true;
  clearInterval(autoplayTimer);

  const leaving = track.children[0];
  const overlay = createOverlay(leaving);

  gsap.timeline({onComplete: done})
    .to(track, {x: -STEP, duration:0.75, ease:"expo.out"}, 0)
    .to(overlay, {left:0,top:0,width:"100vw",height:"100vh",borderRadius:0, duration:0.85, ease:"power3.inOut"}, 0);

  function done() {
    cars.push(cars.shift());
    track.appendChild(track.children[0]);
    gsap.set(track, {x:0});
    updateCenterGlow();
    updateText();
    fadeBg(cars[1].img);
    overlay.remove();
    currentOverlay = null;
    isAnimating = false;
    autoplayTimer = setInterval(goNext, AUTOPLAY_MS);
  }
}

// PREV → rightmost card explodes
function goPrev() {
  if (isAnimating) return;
  isAnimating = true;
  clearInterval(autoplayTimer);

  const leaving = track.children[4]; // last visible
  const overlay = createOverlay(leaving);

  track.insertBefore(track.lastElementChild, track.firstElementChild);
  gsap.set(track, {x: -STEP});

  gsap.timeline({onComplete: done})
    .to(track, {x: 0, duration:0.75, ease:"expo.out"}, 0)
    .to(overlay, {left:0,top:0,width:"100vw",height:"100vh",borderRadius:0, duration:0.85, ease:"power3.inOut"}, 0);

  function done() {
    cars.unshift(cars.pop());
    track.appendChild(track.children[0]);
    gsap.set(track, {x:0});
    updateCenterGlow();
    updateText();
    fadeBg(cars[1].img);
    overlay.remove();
    currentOverlay = null;
    isAnimating = false;
    autoplayTimer = setInterval(goNext, AUTOPLAY_MS);
  }
}

// Init
buildTrack();
autoplayTimer = setInterval(goNext, AUTOPLAY_MS);

prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
});
