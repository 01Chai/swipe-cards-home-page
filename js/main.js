// CAR DATA
const cars = [
  {
    name: "Aventador SVJ",
    desc: "A masterpiece of aerodynamics and power, equipped with a V12 engine."
  },
  {
    name: "Urus Performante",
    desc: "The ultimate performance SUV with exotic power and control."
  },
  {
    name: "Huracán STO",
    desc: "Track-focused, lightweight, and engineered for extreme performance."
  },
  {
    name: "Revuelto",
    desc: "Lamborghini’s hybrid V12 beast, redefining the supercar experience."
  }
];

// DOM ELEMENTS
const sliderTrack = document.getElementById("sliderTrack");
const cards = document.querySelectorAll(".card");
const nameEl = document.getElementById("car-name");
const descEl = document.getElementById("car-desc");

// CONFIG
let currentIndex = 1; // start at first REAL card
const cardWidth = 240; // card width + gap
let autoSlide;

// INITIAL POSITION
sliderTrack.style.transform = `translateX(${-cardWidth * currentIndex}px)`;

// UPDATE UI (active card + text)
function updateActive() {
  document.querySelectorAll(".card").forEach(card => card.classList.remove("active"));
  cards[currentIndex].classList.add("active");

  let realIndex = (currentIndex - 1 + cars.length) % cars.length;

  nameEl.innerText = cars[realIndex].name;
  descEl.innerText = cars[realIndex].desc;
}

// SLIDE TO NEXT
function nextSlide() {
  currentIndex++;
  sliderTrack.style.transition = "transform 0.6s ease";
  sliderTrack.style.transform = `translateX(${-cardWidth * currentIndex}px)`;

  setTimeout(() => {
    if (cards[currentIndex].classList.contains("clone")) {
      sliderTrack.style.transition = "none";
      currentIndex = 1; // reset to first real card
      sliderTrack.style.transform = `translateX(${-cardWidth * currentIndex}px)`;
    }
    updateActive();
  }, 650);
}

// SLIDE TO PREVIOUS
function prevSlide() {
  currentIndex--;
  sliderTrack.style.transition = "transform 0.6s ease";
  sliderTrack.style.transform = `translateX(${-cardWidth * currentIndex}px)`;

  setTimeout(() => {
    if (cards[currentIndex].classList.contains("clone")) {
      sliderTrack.style.transition = "none";
      currentIndex = cars.length;
      sliderTrack.style.transform = `translateX(${-cardWidth * currentIndex}px)`;
    }
    updateActive();
  }, 650);
}

// AUTO LOOP
autoSlide = setInterval(nextSlide, 3500);

// PAUSE ON HOVER
sliderTrack.addEventListener("mouseenter", () => clearInterval(autoSlide));
sliderTrack.addEventListener("mouseleave", () => autoSlide = setInterval(nextSlide, 3500));

// CLICK ANY CARD → MOVE TO THAT CARD
cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    currentIndex = index;
    sliderTrack.style.transition = "transform 0.6s ease";
    sliderTrack.style.transform = `translateX(${-cardWidth * currentIndex}px)`;
    updateActive();
  });
});

// FIRST UPDATE
updateActive();
