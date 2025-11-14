// ===== Data (placeholder images) =====
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

let centerIndex = 1; // center card index (start showing 3 cards: 0,1,2 with index 1 active)
const cardWidth = 240;
const gap = 20;
const step = cardWidth + gap;
const viewportWidth = 760;

let autoplayInterval = 6000;
let autoplayTimer = null;
let isInteracting = false;

// ===== build cards =====
function buildCards() {
  track.innerHTML = '';
  cars.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.innerHTML = `<img src="${c.img}" alt="${c.name}" />`;
    card.addEventListener('click', () => {
      centerIndex = i;
      updateVisuals();
      resetAutoplay();
    });
    track.appendChild(card);
  });
}

// ===== update translate so card at centerIndex is centered in viewport =====
function updateTranslate() {
  // position of card i (left) = i * step
  // we want left edge of card 'centerIndex' to be at (viewportWidth - cardWidth)/2
  const desiredLeft = (viewportWidth - cardWidth) / 2; // 260
  const translateX = -(centerIndex * step - desiredLeft);
  track.style.transform = `translateX(${translateX}px)`;
}

// ===== update active classes, background, and text =====
function updateVisuals() {
  // clamp centerIndex to [0 .. n-1]
  if (centerIndex < 0) centerIndex = 0;
  if (centerIndex > cars.length - 1) centerIndex = cars.length - 1;

  // set active card
  document.querySelectorAll('.card').forEach(el => el.classList.remove('active'));
  const activeCard = document.querySelector(`.card[data-index="${centerIndex}"]`);
  if (activeCard) activeCard.classList.add('active');

  // translate track
  updateTranslate();

  // background fade + subtle zoom
  bg.style.opacity = 0;
  setTimeout(() => {
    bg.style.backgroundImage = `url(${cars[centerIndex].img})`;
    bg.style.transform = 'scale(1.04)';
    bg.style.opacity = 1;
    // slowly return scale to 1
    setTimeout(() => { bg.style.transform = 'scale(1)'; }, 900);
  }, 260);

  // update text with staggered reveal
  title.style.animation = 'none';
  subtitle.style.animation = 'none';
  rentBtn.style.animation = 'none';
  // set content
  title.textContent = cars[centerIndex].name;
  subtitle.textContent = cars[centerIndex].desc;
  // trigger animations
  setTimeout(() => {
    title.style.animation = 'fadeUp 650ms forwards';
    subtitle.style.animation = 'fadeUp 650ms 200ms forwards';
    rentBtn.style.animation = 'fadeUp 650ms 380ms forwards';
  }, 50);
}

// ===== autoplay =====
function startAutoplay() {
  stopAutoplay();
  autoplayTimer = setInterval(() => {
    if (!isInteracting) {
      centerIndex = (centerIndex + 1) % cars.length;
      updateVisuals();
    }
  }, autoplayInterval);
}
function stopAutoplay() { if (autoplayTimer) clearInterval(autoplayTimer); }
function resetAutoplay(){ stopAutoplay(); startAutoplay(); }

// ===== touch / swipe support =====
let touchStartX = 0;
let touchDeltaX = 0;
track.addEventListener('pointerdown', (e) => {
  isInteracting = true;
  touchStartX = e.clientX;
  track.style.transition = 'none';
});
window.addEventListener('pointermove', (e) => {
  if (!isInteracting) return;
  touchDeltaX = e.clientX - touchStartX;
  // visually move track with pointer for a feel
  const currentTranslate = -(centerIndex * step - (viewportWidth - cardWidth)/2);
  track.style.transform = `translateX(${currentTranslate + touchDeltaX}px)`;
});
window.addEventListener('pointerup', (e) => {
  if (!isInteracting) return;
  track.style.transition = 'transform .6s cubic-bezier(.22,.9,.32,1)';
  if (Math.abs(touchDeltaX) > 50) {
    if (touchDeltaX < 0 && centerIndex < cars.length - 1) centerIndex++;
    else if (touchDeltaX > 0 && centerIndex > 0) centerIndex--;
  }
  touchDeltaX = 0;
  isInteracting = false;
  updateVisuals();
  resetAutoplay();
});

// Pause autoplay when hovering the gallery (desktop)
const galleryViewport = document.querySelector('.gallery-viewport');
galleryViewport.addEventListener('mouseenter', ()=> { isInteracting = true; });
galleryViewport.addEventListener('mouseleave', ()=> { isInteracting = false; });

// keyboard left/right support
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { if (centerIndex < cars.length - 1) centerIndex++; updateVisuals(); resetAutoplay(); }
  if (e.key === 'ArrowLeft')  { if (centerIndex > 0) centerIndex--; updateVisuals(); resetAutoplay(); }
});

// ===== init =====
buildCards();
updateVisuals();
startAutoplay();

// Make sure layout is correct after fonts/images load (recompute translate)
window.addEventListener('load', () => { updateTranslate(); });
window.addEventListener('resize', () => { updateTranslate(); });
