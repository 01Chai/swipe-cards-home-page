// js/main.js → LEFT CARD IS KING

const cars = [
  { name: "Aventador SVJ", desc: "770 HP • The final NA V12 monster", img: "https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1600&auto=format&fit=crop" },
  { name: "Huracán Tecnica", desc: "640 HP • Rear-wheel drive perfection", img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1600&auto=format&fit=crop" },
  { name: "Urus Performante", desc: "666 HP • The super SUV benchmark", img: "https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1600&auto=format&fit=crop" },
  { name: "Revuelto", desc: "1015 HP • Hybrid future is here", img: "https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1600&auto=format&fit=crop" },
  { name: "Gallardo Superleggera", desc: "570 HP • Lightweight legend", img: "https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1600&auto=format&fit=crop" }
];

const track = document.getElementById('track');
const bg = document.getElementById('bg');
const titleEl = document.getElementById('carTitle');
const descEl = document.getElementById('carDesc');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const STEP = 180; // 160 + 20 gap
let isAnimating = false;
let overlay = null;

function build() {
  track.innerHTML = '';
  cars.forEach(car => {
    const div = document.createElement('div');
    div.className = 'card';
    if (track.childElementCount === 0) div.classList.add('active');
    div.innerHTML = `<img src="${car.img}" alt="${car.name}"><div class="label">${car.name}</div>`;
    track.appendChild(div);
  });
  updateActive();
  updateText();
  bg.style.backgroundImage = `url(${cars[0].img})`;
}

function updateActive() {
  track.querySelectorAll('.card').forEach((c, i) => {
    c.classList.toggle('active', i === 0);
  });
}

function updateText() {
  gsap.to([titleEl, descEl], {opacity: 0, y: 20, duration: 0.3, onComplete: () => {
    titleEl.textContent = cars[0].name;
    descEl.textContent = cars[0].desc;
    gsap.to([titleEl, descEl], {opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"});
  }});
}

function createOverlay(cardEl) {
  if (overlay) overlay.remove();
  const r = cardEl.getBoundingClientRect();
  overlay = document.createElement('div');
  overlay.className = 'becoming-overlay';
  overlay.style.cssText = `
    left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;
    background-image:url(${cardEl.querySelector('img').src});
  `;
  document.body.appendChild(overlay);
  overlay.offsetHeight;
  return overlay;
}

// NEXT → left card explodes + goes to end
function goNext() {
  if (isAnimating) return;
  isAnimating = true;

  const leaving = track.children[0];
  const ov = createOverlay(leaving);

  gsap.timeline({
    onComplete: () => {
      cars.push(cars.shift());
      track.appendChild(track.children[0]); // move left card to end
      gsap.set(track, {x: 0});
      updateActive();
      updateText();
      bg.style.backgroundImage = `url(${cars[0].img})`;
      overlay.remove();
      overlay = null;
      isAnimating = false;
    }
  })
  .to(track, {x: -STEP, duration: 0.95, ease: "power4.out"}, 0)
  .to(ov, {left:0, top:0, width:"100vw", height:"100vh", borderRadius:0, scale:1.18, duration:1.15, ease:"power3.inOut"}, 0)
  .to(ov, {scale:1, duration:0.5}, 0.95);
}

// PREV → card comes from left, current left becomes new background
function goPrev() {
  if (isAnimating) return;
  isAnimating = true;

  // Move last to front first
  const lastCard = track.lastElementChild;
  track.insertBefore(lastCard, track.firstElementChild);
  gsap.set(track, {x: -STEP});

  const nowLeaving = track.children[0]; // this is the one that will explode
  const ov = createOverlay(nowLeaving);

  gsap.timeline({
    onComplete: () => {
      cars.unshift(cars.pop());
      track.appendChild(track.children[0]);
      gsap.set(track, {x: 0});
      updateActive();
      updateText();
      bg.style.backgroundImage = `url(${cars[0].img})`;
      overlay.remove();
      overlay = null;
      isAnimating = false;
    }
  })
  .to(track, {x: 0, duration: 0.95, ease: "power4.out"}, 0)
  .to(ov, {left:0, top:0, width:"100vw", height:"100vh", borderRadius:0, scale:1.18, duration:1.15, ease:"power3.inOut"}, 0)
  .to(ov, {scale:1, duration:0.5}, 0.95);
}

// Controls + Autoplay
prevBtn.onclick = goPrev;
nextBtn.onclick = goNext;
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
});

build();
setInterval(goNext, 6000);
