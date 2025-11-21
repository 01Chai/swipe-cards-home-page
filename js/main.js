const cars = [
  {n:"Aventador SVJ",     d:"770 HP • Pure V12 rage",         img:"https://images.unsplash.com/photo-1619946794135-5bc917a2772f?q=80&w=1640&auto=format&fit=crop"},
  {n:"Huracán Tecnica",   d:"640 HP • RWD perfection",        img:"https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1640&auto=format&fit=crop"},
  {n:"Urus Performante",  d:"666 HP • Fastest SUV alive",     img:"https://images.unsplash.com/photo-1610395219791-7c03d32a7ece?q=80&w=1640&auto=format&fit=crop"},
  {n:"Revuelto",          d:"1015 HP • Hybrid future",        img:"https://images.unsplash.com/photo-1705502823166-6fe39a3cff53?q=80&w=1640&auto=format&fit=crop"},
  {n:"Gallardo",          d:"V10 legend • Never dies",        img:"https://images.unsplash.com/photo-1618477462327-6f909fcdf130?q=80&w=1640&auto=format&fit=crop"}
];

const track = document.getElementById('track');
const bg    = document.getElementById('bg');
const title = document.getElementById('title');
const desc  = document.getElementById('desc');
let overlay = null;
let busy = false;
const STEP = 198; // 170 + 28

function init() {
  track.innerHTML = cars.map(c=>`
    <div class="card"><img src="${c.img}"><div class="label">${c.n}</div></div>
  `).join('');
  markActive();
  updateInfo();
  bg.style.backgroundImage = `url(${cars[0].img})`;
}

function markActive() {
  [...track.children].forEach((c,i)=>c.classList.toggle('active',i===0));
}

function updateInfo() {
  title.textContent = cars[0].n;
  desc.textContent  = cars[0].d;
}

function explode(card) {
  if (overlay) overlay.remove();
  const r = card.getBoundingClientRect();
  overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background-image:url(${card.querySelector('img').src})`;
  document.body.appendChild(overlay);
  overlay.offsetHeight;
  return overlay;
}

// NEXT → left card explodes + goes to the end
function next() {
  if (busy) return; busy = true;
  const leaving = track.children[0];
  const ov = explode(leaving);

  gsap.timeline({onComplete:done})
    .to(track, {x:-STEP, duration:1.05, ease:"power4.out"},0)
    .to(ov, {left:0,top:0,width:"100vw",height:"100vh",borderRadius:0,scale:1.22,duration:1.25,ease:"power3.inOut"},0)
    .to(ov, {scale:1, duration:0.5},1.05);

  function done() {
    cars.push(cars.shift());
    track.appendChild(track.children[0]);
    gsap.set(track,{x:0});
    markActive(); updateInfo();
    bg.style.backgroundImage = `url(${cars[0].img})`;
    overlay.remove(); overlay=null; busy=false;
  }
}

// PREV → reverse
function prev() {
  if (busy) return; busy = true;
  track.insertBefore(track.lastElementChild, track.firstElementChild);
  gsap.set(track,{x:-STEP});

  const leaving = track.children[0];
  const ov = explode(leaving);

  gsap.timeline({onComplete:done})
    .to(track, {x:0, duration:1.05, ease:"power4.out"},0)
    .to(ov, {left:0,top:0,width:"100vw",height:"100vh",borderRadius:0,scale:1.22,duration:1.25,ease:"power3.inOut"},0)
    .to(ov, {scale:1, duration:0.5},1.05);

  function done() {
    cars.unshift(cars.pop());
    track.appendChild(track.children[0]);
    gsap.set(track,{x:0});
    markActive(); updateInfo();
    bg.style.backgroundImage = `url(${cars[0].img})`;
    overlay.remove(); overlay=null; busy=false;
  }
}

document.getElementById('prev').onclick = prev;
document.getElementById('next').onclick = next;

init();
setInterval(next, 5800);
