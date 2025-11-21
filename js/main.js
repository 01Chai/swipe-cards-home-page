const cars = [
  {n:"Aventador SVJ",d:"770 HP • Final V12 masterpiece",img:"https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1800&auto=format&fit=crop"},
  {n:"Huracán STO",d:"640 HP • Track-honed perfection",img:"https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1800&auto=format&fit=crop"},
  {n:"Urus Performante",d:"666 HP • Super SUV royalty",img:"https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1800&auto=format&fit=crop"},
  {n:"Revuelto",d:"1015 HP • The hybrid era begins",img:"https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1800&auto=format&fit=crop"},
  {n:"Gallardo",d:"V10 legend • Forever",img:"https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1800&auto=format&fit=crop"}
];

const track = document.getElementById('track');
const bg = document.getElementById('bg');
const title = document.getElementById('title');
const desc = document.getElementById('desc');
const btn = document.querySelector('.info button');
let current = 0;
let expanding = null;

function init() {
  track.innerHTML = cars.map((c,i) => `
    <div class="card" data-index="${i}">
      <img src="${c.img}" alt="${c.n}">
      <div class="label">${c.n}</div>
    </div>
  `).join('');
  updateActive();
  showText(0);
}

function updateActive() {
  track.querySelectorAll('.card').forEach((c,i) => {
    c.classList.toggle('active', i === current);
  });
}

function showText(idx) {
  const car = cars[idx];
  title.textContent = car.n;
  desc.textContent = car.d;
  gsap.fromTo([title, desc, btn], 
    {opacity:0, y:50},
    {opacity:1, y:0, duration:1.8, stagger:0.3, ease:"power2.out"}
  );
}

function explodeAndRemove(cardEl, direction = "next") {
  if (expanding) return;
  const rect = cardEl.getBoundingClientRect();
  const img = cardEl.querySelector('img').src;

  expanding = document.createElement('div');
  expanding.className = 'expand';
  expanding.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;background-image:url(${img})`;
  document.body.appendChild(expanding);

  // Hide the original card immediately
  cardEl.style.opacity = 0;

  const tl = gsap.timeline({
    onComplete: () => {
      if (direction === "next") {
        current = (current + 1) % cars.length;
        track.appendChild(track.children[0]);
      } else {
        current = (current - 1 + cars.length) % cars.length;
        track.insertBefore(track.lastElementChild, track.firstElementChild);
      }
      gsap.set(track, {x:0});
      updateActive();
      showText(current);
      bg.style.backgroundImage = `url(${cars[current].img})`;
      expanding.remove();
      expanding = null;
      track.querySelectorAll('.card').forEach(c => c.style.opacity = 1);
    }
  });

  if (direction === "next") {
    tl.to(track, {x: -205, duration: 1.6, ease: "power3.inOut"}, 0.3);
  } else {
    gsap.set(track, {x: -205});
    tl.to(track, {x: 0, duration: 1.6, ease: "power3.inOut"}, 0.3);
  }

  tl.to(expanding, {
    left: 0, top: 0, width: "100vw", height: "100vh",
    borderRadius: 0,
    duration: 2.2,
    ease: "power3.inOut"
  }, 0);

  tl.to(expanding, {scale: 1.08}, 1.2);
  tl.to(expanding, {scale: 1, duration: 1}, 1.8);
}

document.getElementById('next').onclick = () => explodeAndRemove(track.children[0], "next");
document.getElementById('prev').onclick = () => {
  track.insertBefore(track.lastElementChild, track.firstElementChild);
  explodeAndRemove(track.children[0], "prev");
};

init();
setInterval(() => document.getElementById('next').click(), 7000);
