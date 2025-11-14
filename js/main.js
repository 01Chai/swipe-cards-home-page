const cars = [
  { name: "Lamborghini Aventador", desc: "V12 power meets timeless design. The Aventador defines pure performance with iconic lines and raw energy.", img: "https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1600" },
  { name: "Lamborghini Huracán",   desc: "Compact, fierce, and precision engineered for heart-pounding control on any road.", img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1600" },
  { name: "Lamborghini Urus",      desc: "The world’s first Super SUV — merging luxury, space, and speed into one unstoppable force.", img: "https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1600" },
  { name: "Lamborghini Gallardo",  desc: "A timeless classic that redefined the modern supercar era.", img: "https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1600" },
  { name: "Lamborghini Revuelto",  desc: "A futuristic hybrid V12 redefining luxury performance.", img: "https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1600" }
];

const track = document.getElementById('track');
const bg = document.getElementById('bg');
const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const rentBtn = document.getElementById('rentBtn');
const info = document.querySelector('.info');
const carousel = document.querySelector('.carousel');

let index = 0;
const total = cars.length;
const cardWidth = 240;
const gap = 20;
const step = cardWidth + gap;
let autoplayTimer = null;
const autoplayDelay = 5000;
let isDragging = false;
let startX, currentTranslate = 0;

// Clone first/last for infinite loop
function buildInfiniteTrack() {
  track.innerHTML = '';
  [...cars.slice(-2), ...cars, ...cars.slice(0, 2)].forEach((car, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.origIndex = (i - 2 + total) % total;
    card.innerHTML = `<img src="${car.img}" alt="${car.name}" loading="lazy">`;
    card.addEventListener('click', () => goToIndex(parseInt(card.dataset.origIndex)));
    card.tabIndex = 0;
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') goToIndex(parseInt(card.dataset.origIndex));
    });
    track.appendChild(card);
  });
  updateActiveCard();
  positionTrack();
}

// Center the active card
function positionTrack() {
  const offset = -((index + 2) * step) + (760 - cardWidth) / 2;
  track.style.transform = `translateX(${offset}px)`;
  currentTranslate = offset;
}

// Update active card + content
function updateActiveCard() {
  const activeIndex = index + 2;
  document.querySelectorAll('.card').forEach((c, i) => {
    c.classList.toggle('active', i === activeIndex);
  });

  // Background
  bg.classList.remove('active');
  setTimeout(() => {
    bg.style.backgroundImage = `url(${cars[index].img})`;
    bg.classList.add('active');
  }, 300);

  // Text
  info.style.opacity = '0';
  setTimeout(() => {
    title.textContent = cars[index].name;
    subtitle.textContent = cars[index].desc;
    info.style.opacity = '1';
    info.style.animation = 'fadeInUp .6s forwards';
  }, 300);
}

// Go to index with loop reset
function goToIndex(newIndex) {
  index = newIndex;
  updateActiveCard();
  positionTrack();
  resetAutoplay();
  checkLoopReset();
}

// Check if we need to reset loop
function checkLoopReset() {
  if (index >= total) {
    setTimeout(() => { index = 0; positionTrack(); }, 600);
  } else if (index < 0) {
    setTimeout(() => { index = total - 1; positionTrack(); }, 600);
  }
}

// Autoplay
function startAutoplay() {
  stopAutoplay();
  autoplayTimer = setInterval(() => {
    goToIndex((index + 1) % total);
  }, autoplayDelay);
}
function stopAutoplay() { clearInterval(autoplayTimer); }
function resetAutoplay() { stopAutoplay(); startAutoplay(); }

// Touch/Mouse drag
let startPos = 0;
carousel.addEventListener('pointerdown', e => {
  isDragging = true;
  startPos = e.clientX;
  startX = currentTranslate;
  track.style.transition = 'none';
  carousel.style.cursor = 'grabbing';
});
window.addEventListener('pointermove', e => {
  if (!isDragging) return;
  const delta = e.clientX - startPos;
  track.style.transform = `translateX(${startX + delta}px)`;
});
window.addEventListener('pointerup', e => {
  if (!isDragging) return;
  isDragging = false;
  track.style.transition = 'transform .6s cubic-bezier(0.22, 0.9, 0.32, 1)';
  carousel.style.cursor = 'grab';

  const movedBy = e.clientX - startPos;
  if (Math.abs(movedBy) > 50) {
    goToIndex(index + (movedBy < 0 ? 1 : -1));
  } else {
    positionTrack();
  }
});

// Keyboard
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goToIndex(index + 1);
  if (e.key === 'ArrowLeft') goToIndex(index - 1);
});

// Pause on hover
carousel.addEventListener('mouseenter', stopAutoplay);
carousel.addEventListener('mouseleave', startAutoplay);

// Init
buildInfiniteTrack();
bg.style.backgroundImage = `url(${cars[0].img})`;
setTimeout(() => bg.classList.add('active'), 100);
startAutoplay();

// Resize
window.addEventListener('resize', () => {
  setTimeout(positionTrack, 100);
});
