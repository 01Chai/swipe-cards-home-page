const cars = [
  {img: "https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1600&auto=format&fit=crop", model: "Aventador"},
  {img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1600&auto=format&fit=crop", model: "Huracan"},
  {img: "https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1600&auto=format&fit=crop", model: "Urus"},
  {img: "https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1600&auto=format&fit=crop", model: "Revuelto"},
  {img: "https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1600&auto=format&fit=crop", model: "Gallardo"}
];

const track = document.getElementById('track');
const bg = document.getElementById('bg');
const cta = document.querySelector('.cta-overlay');
let clone = null;

// Build track
cars.forEach(car => {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `<img src="${car.img}">`;
  track.appendChild(div);
});

bg.style.backgroundImage = `url(${cars[0].img})`;

// Translation simulation (like video's middleware)
function translate(text, toLang = 'es') {
  // Mock Google Translate — in real app, use api
  const translations = {
    en: { 'Rent luxury now': 'Alquila lujo ahora' },
    es: { 'Rent luxury now': 'Alquila lujo ahora' }
  };
  return Promise.resolve(translations[toLang]?.[text] || text);
}

// Swipe + explode (matches video timing)
function swipe(dir = 'next') {
  if (clone) return;
  const card = track.children[0];
  const r = card.getBoundingClientRect();

  clone = document.createElement('div');
  clone.className = 'clone';
  clone.style.left = r.left + 'px';
  clone.style.top = r.top + 'px';
  clone.style.width = r.width + 'px';
  clone.style.height = r.height + 'px';
  clone.style.backgroundImage = `url(${card.querySelector('img').src})`;
  document.body.appendChild(clone);

  card.style.opacity = 0;

  gsap.timeline({
    onComplete: () => {
      bg.style.backgroundImage = `url(${card.querySelector('img').src})`;
      clone.remove(); clone = null;
      card.style.opacity = 1;

      // Simulate translation on new bg
      translate('Rent luxury now').then(translated => {
        document.querySelector('.cta-overlay a').textContent = translated;
        gsap.to(cta, {opacity:1, duration:1, delay:1});
      });
    }
  })
  .to(clone, {left:0, top:0, width:'100vw', height:'100vh', borderRadius:0, duration:1.5, ease:'power2.inOut'}, 0)
  .to(track, {x: dir === 'next' ? -180 : 0, duration:1.5, ease:'power2.inOut'}, 0);

  if (dir === 'next') {
    gsap.to(track, {x:0, duration:0, onComplete: () => {
      track.appendChild(track.children[0]);
      gsap.set(track, {x:0});
    }}, 1.5);
  } else {
    gsap.set(track, {x: -180});
    track.insertBefore(track.lastElementChild, track.firstElementChild);
  }
}

document.getElementById('next').onclick = () => swipe('next');
document.getElementById('prev').onclick = () => swipe('prev');

setInterval(() => swipe('next'), 6000);
