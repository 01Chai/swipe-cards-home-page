// Lamborghini demo data
const cars = [
  {
    name: "Lamborghini Aventador",
    desc: "A V12 masterpiece with breathtaking acceleration and unmatched style.",
    img: "https://images.unsplash.com/photo-1541844053589-346841d0b34a?q=80&w=1200"
  },
  {
    name: "Lamborghini Huracán",
    desc: "A perfect blend of power and elegance with a roaring V10 engine.",
    img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1200"
  },
  {
    name: "Lamborghini Urus",
    desc: "The world’s first Super Sport SUV with unbelievable performance.",
    img: "https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1200"
  },
  {
    name: "Lamborghini Gallardo",
    desc: "A timeless classic that redefined the modern supercar era.",
    img: "https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1200"
  },
  {
    name: "Lamborghini Revuelto",
    desc: "A futuristic hybrid V12 redefining luxury performance.",
    img: "https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1200"
  }
];

// DOM elements
const background = document.getElementById("background");
const thumbSlider = document.getElementById("thumbSlider");
const carName = document.getElementById("carName");
const carDesc = document.getElementById("carDesc");
const rentBtn = document.getElementById("rentBtn");

let currentIndex = 0;
let autoPlay;

// LOAD THUMBNAILS
function loadThumbnails() {
  thumbSlider.innerHTML = "";

  cars.forEach((car, index) => {
    const card = document.createElement("div");
    card.classList.add("thumb-card");
    if (index === currentIndex) card.classList.add("active");

    card.innerHTML = `<img src="${car.img}" />`;

    card.addEventListener("click", () => {
      currentIndex = index;
      updateSlide();
      resetAutoplay();
    });

    thumbSlider.appendChild(card);
  });
}

// UPDATE BACKGROUND & TEXT
function updateSlide() {
  const car = cars[currentIndex];

  // Smooth fade + zoom
  background.style.opacity = 0;
  setTimeout(() => {
    background.style.backgroundImage = `url(${car.img})`;
    background.style.transform = "scale(1.04)";
    background.style.opacity = 1;
    setTimeout(() => (background.style.transform = "scale(1)"), 1200);
  }, 400);

  // Update text (retrigger animations)
  carName.textContent = car.name;
  carDesc.textContent = car.desc;

  carName.style.animation = "none";
  carDesc.style.animation = "none";
  rentBtn.style.animation = "none";

  setTimeout(() => {
    carName.style.animation = "fadeUp 1s forwards";
    carDesc.style.animation = "fadeUp 1s 0.2s forwards";
    rentBtn.style.animation = "fadeUp 1s 0.4s forwards";
  }, 50);

  loadThumbnails();
}

// AUTOPLAY
function startAutoplay() {
  autoPlay = setInterval(() => {
    currentIndex = (currentIndex + 1) % cars.length;
    updateSlide();
  }, 5000);
}

function resetAutoplay() {
  clearInterval(autoPlay);
  startAutoplay();
}

// INITIALIZE
updateSlide();
startAutoplay();

