// ===== Data =====
const cars = [
  { name: "Lamborghini Aventador", desc: "V12 power meets timeless design. The Aventador defines pure performance with iconic lines and raw energy.", img: "https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1600" },
  { name: "Lamborghini Huracán",   desc: "Compact, fierce, and precision engineered for heart-pounding control on any road.", img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1600" },
  { name: "Lamborghini Urus",      desc: "The world’s first Super SUV — merging luxury, space, and speed into one unstoppable force.", img: "https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1600" },
  { name: "Lamborghini Gallardo",  desc: "A timeless classic that redefined the modern supercar era.", img: "https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1600" },
  { name: "Lamborghini Revuelto",  desc: "A futuristic hybrid V12 redefining luxury performance.", img: "https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1600" }
];

// ===== DOM =====
const track = document.getElementById('track');
const bg = document.getElementById('bg');
const title = document.getElementById('carTitle');
const subtitle = document.getElementById('carSubtitle');
const rentBtn = document.getElementById('rentBtn');
const gallery = document.querySelector('.gallery-viewport');

let centerIndex = 0;
const total = cars.length;
let autoplayTimer = null;
const autoplayInterval = 6000;
let isInteracting = false;

// ===== Build Cards =====
function buildCards() {
  track.innerHTML = '';
  cars.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${c.name}`);
    card.innerHTML = `<img src="${c.img}" alt="${c.name}" loading="lazy">`;
    card.addEventListener('click', () => selectCard(i));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCard(i);
      }
    });
    track.appendChild(card);
  });
}

// ===== Select Card (Infinite Loop) =====
function selectCard(index) {
  centerIndex = (index + total) % total;
  updateVisuals();
  resetAutoplay();
}

// ===== Update Visuals =====
function updateVisuals() {
  document.querySelectorAll('.card').forEach((el, i) => {
    el.classList.toggle('active', i === centerIndex);
  });

  // Background fade + zoom
  bg.style.opacity = 0;
  setTimeout(() => {
    bg.style.backgroundImage = `url(${cars[centerIndex].img})`;
    bg.style.transform = 'scale(1.04)';
    bg.style.opacity = 1;
    setTimeout(() => { bg.style.transform = 'scale(1)'; }, 900);
  }, 260);

  // Text with staggered fade-up
  title.style.animation = 'none';
  subtitle.style.animation = 'none';
  rentBtn.style.animation = 'none';
  title.textContent = cars[centerIndex].name;
  subtitle.textContent = cars[centerIndex].desc;
  setTimeout(() => {
    title.style.animation = 'fadeUp 650ms forwards';
    subtitle.style.animation = 'fadeUp 650ms 200ms forwards';
    rentBtn.style.animation = 'fadeUp 650ms 380ms forwards';
  }, 50);
}

// ===== Autoplay =====
function startAutoplay() {
  stopAutoplay();
  autoplayTimer = setInterval(() => {
    if (!isInteracting) {
      centerIndex = (centerIndex + 1) % total;
      updateVisuals();
    }
  }, autoplayInterval);
}
function stopAutoplay() { if (autoplayTimer) clearInterval(autoplayTimer); }
function resetAutoplay() { stopAutoplay(); startAutoplay(); }

// ===== Touch Swipe (Mobile: vertical → horizontal layout) =====
let touchStartY = 0;
gallery.addEventListener('pointerdown', e => {
  isInteracting = true;
  touchStartY = e.clientY;
});
window.addEventListener('pointerup', e => {
  if (!isInteracting) return;
  const delta = touchStartY - e.clientY;
  if (Math.abs(delta) > 50) {
    selectCard(centerIndex + (delta > 0 ? 1 : -1));
  }
  isInteracting = false;
});

// Pause on hover
gallery.addEventListener('mouseenter', () => isInteracting = true);
gallery.addEventListener('mouseleave', () => isInteracting = false);

// Keyboard navigation
window.addEventListener('keydown', e => {
  if (['ArrowDown', 'ArrowRight'].includes(e.key)) selectCard(centerIndex + 1);
  if (['ArrowUp', 'ArrowLeft'].includes(e.key)) selectCard(centerIndex - 1);
});

// ===== Init =====
buildCards();
bg.style.backgroundImage = `url(${cars[0].img})`;
updateVisuals();
startAutoplay();

// Debounced resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {}, 200);
});
