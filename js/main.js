// js/main.js — FINAL LAMBORGHINI-GRADE VERSION

const cars = [
  { name: "Aventador SVJ", desc: "V12 • 770 HP • 0-100 in 2.8s", img: "https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1600&auto=format&fit=crop" },
  { name: "Huracán EVO", desc: "V10 • 640 HP • Pure adrenaline", img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1600&auto=format&fit=crop" },
  { name: "Urus Performante", desc: "V8 Twin-Turbo • 666 HP • King of SUVs", img: "https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1600&auto=format&fit=crop" },
  { name: "Revuelto", desc: "Hybrid V12 • 1015 HP • The future", img: "https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1600&auto=format&fit=crop" },
  { name: "Gallardo LP570-4", desc: "V10 • Legend never dies", img: "https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1600&auto=format&fit=crop" }
];

const track = document.getElementById('track');
const bg = document.getElementById('bg');
const titleEl = document.getElementById('carTitle');
const descEl = document.getElementById('carDesc');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const STEP = 180; // 160 + 20
let isAnimating = false;
let overlay = null;

function build() {
  track.innerHTML = '';
  cars.forEach(car => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<img src="${car.img}" alt="${car.name}"><div class="label">${car.name}</div>`;
    track.appendChild(div);
  });
  updateGlow();
  updateText();
  bg.style.backgroundImage = `url(${cars[1].img})`;
}

function updateGlow() { track.querySelectorAll('.card').forEach((c,i)=>c.classList.toggle('center', i===1)); }
function updateText() {
  titleEl.textContent = cars[1].name;
  descEl.textContent = cars[1].desc;
  gsap.fromTo([titleEl,descEl], {y:30,opacity:0}, {y:0,opacity:1,duration:0.9,stagger:0.12,ease:"power2.out"});
}

function createOverlay(cardEl) {
  if (overlay) overlay.remove();
  const r = cardEl.getBoundingClientRect();
  const img = cardEl.querySelector('img').src;

  overlay = document.createElement('div');
  overlay.className = 'becoming-overlay';
  overlay.style.cssText = `
    left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;
    background-image:url(${img});
  `;
  document.body.appendChild(overlay);
  overlay.offsetHeight; // force reflow
  return overlay;
}

// NEXT — leftmost card explodes outward
function goNext() {
  if (isAnimating) return;
  isAnimating = true;

  const leavingCard = track.children[0];
  const ov = createOverlay(leavingCard);

  gsap.timeline({
    onComplete: () => {
      cars.push(cars.shift());
      track.appendChild(track.children[0]);
      gsap.set(track, {x:0});
      updateGlow(); updateText();
      bg.style.backgroundImage = `url(${cars[1].img})`;
      overlay.remove(); overlay = null;
      isAnimating = false;
    }
  })
  .to(track, {x: -STEP, duration: 0.9, ease: "power4.out"}, 0)
  .to(ov, {
    left: 0, top: 0, width: "100vw", height: "100vh",
    borderRadius: 0,
    scale: 1.15,  // tiny extra drama
    duration: 1.1,
    ease: "power3.inOut"
  }, 0)
  .to(ov, {scale: 1, duration: 0.6}, 0.85); // snap back to exact size
}

// PREV — rightmost card explodes outward
function goPrev() {
  if (isAnimating) return;
  isAnimating = true;

  const leavingCard = track.children[4];
  const ov = createOverlay(leavingCard);

  track.insertBefore(track.lastElementChild, track.firstElementChild);
  gsap.set(track, {x: -STEP});

  gsap.timeline({
    onComplete: () => {
      cars.unshift(cars.pop());
      track.appendChild(track.children[0]);
      gsap.set(track, {x:0});
      updateGlow(); updateText();
      bg.style.backgroundImage = `url(${cars[1].img})`;
      overlay.remove(); overlay = null;
      isAnimating = false;
    }
  })
  .to(track, {x: 0, duration: 0.9, ease: "power4.out"}, 0)
  .to(ov, {
    left: 0, top: 0, width: "100vw", height: "100vh",
    borderRadius: 0,
    scale: 1.15,
    duration: 1.1,
    ease: "power3.inOut"
  }, 0)
  .to(ov, {scale: 1, duration: 0.6}, 0.85);
}

// Controls
prevBtn.onclick = goPrev;
nextBtn.onclick = goNext;
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
});

// Init
build();
setInterval(goNext, 5500); // autoplay
