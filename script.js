const scrollProgress = document.querySelector(".scroll-progress");
window.addEventListener("scroll",()=> {
  const max=document.documentElement.scrollHeight-window.innerHeight;
  scrollProgress.style.transform=`scaleX(${max>0?window.scrollY/max:0})`;
},{passive:true});

const API_ENDPOINT = "/api/answer"; // Backend endpoint. See server.js.
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: .12});
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Parallax for selected images
if (!prefersReduced) {
  const parallaxItems = document.querySelectorAll(".moment-image img, .photo img");
  window.addEventListener("scroll", () => {
    const vh = window.innerHeight;
    parallaxItems.forEach(img => {
      const r = img.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const shift = (r.top + r.height/2 - vh/2) * -0.025;
        img.style.transform = `translateY(${shift}px) scale(1.03)`;
      }
    });
  }, {passive:true});
}

// Image lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
document.querySelectorAll(".gallery-item img, .photo img").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImage.src = img.currentSrc || img.src;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  });
});
document.querySelectorAll(".lightbox-close").forEach(btn => btn.addEventListener("click", () => {
  lightbox.classList.remove("open");
  document.getElementById("videoModal").classList.remove("open");
  document.body.classList.remove("no-scroll");
}));
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) lightbox.classList.remove("open");
});

// Video modal
const videoModal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");
document.querySelectorAll(".reel-card").forEach(card => {
  const v = card.querySelector("video");
  card.addEventListener("mouseenter", () => v.play().catch(()=>{}));
  card.addEventListener("mouseleave", () => { v.pause(); v.currentTime = 0; });
  card.addEventListener("click", () => {
    modalVideo.src = card.dataset.video;
    videoModal.classList.add("open");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    modalVideo.play().catch(()=>{});
  });
});

// Envelope
const openInvite = document.getElementById("openInvite");
const invite = document.getElementById("invite");
openInvite.addEventListener("click", () => {
  invite.classList.add("open");
  invite.setAttribute("aria-hidden", "false");
  setTimeout(() => invite.scrollIntoView({behavior: prefersReduced ? "auto" : "smooth", block:"center"}), 100);
});

// Playful "No" button — smoothly escapes the cursor.
const noBtn = document.getElementById("noBtn");
const noTexts = ["Нет", "Точно?", "Подумай ещё раз :)", "Кажется, эта кнопка ошиблась.", "Не сегодня 😌"];
let noIndex = 0;
let noReady = false;
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight * .78;
let currentX = targetX, currentY = targetY;
let raf = 0;

function renderNo(){
  currentX += (targetX - currentX) * 0.16;
  currentY += (targetY - currentY) * 0.16;
  noBtn.style.left = `${currentX}px`;
  noBtn.style.top = `${currentY}px`;
  raf = requestAnimationFrame(renderNo);
}
renderNo();

function moveNoAway(x,y){
  const r = noBtn.getBoundingClientRect();
  const margin = 22;
  const minDistance = Math.max(190, Math.min(320, window.innerWidth * .22));
  const maxX = window.innerWidth - r.width - margin;
  const maxY = window.innerHeight - r.height - margin;
  let best = null, bestScore = -Infinity;

  for(let i=0;i<28;i++){
    const nx = margin + Math.random()*Math.max(1,maxX-margin);
    const ny = margin + Math.random()*Math.max(1,maxY-margin);
    const d = Math.hypot(nx + r.width/2 - x, ny + r.height/2 - y);
    const edgeBonus = Math.min(nx,ny,window.innerWidth-nx,window.innerHeight-ny);
    const score = d + edgeBonus*.18;
    if(d >= minDistance && score > bestScore){best={x:nx,y:ny};bestScore=score}
  }
  if(!best){
    best={x:margin+Math.random()*Math.max(1,maxX-margin),y:margin+Math.random()*Math.max(1,maxY-margin)};
  }
  targetX=best.x; targetY=best.y;
  noBtn.textContent=noTexts[noIndex++ % noTexts.length];
  noBtn.style.transform=`rotate(${(Math.random()*6-3).toFixed(1)}deg) scale(.98)`;
  noReady=true;
}

noBtn.addEventListener("mouseenter", e=>moveNoAway(e.clientX,e.clientY));
noBtn.addEventListener("pointerdown", e=>{e.preventDefault();moveNoAway(e.clientX,e.clientY)});
noBtn.addEventListener("touchstart", e=>{
  e.preventDefault();
  const t=e.touches[0]; moveNoAway(t.clientX,t.clientY);
},{passive:false});

window.addEventListener("pointermove",e=>{
  if(!noReady)return;
  const r=noBtn.getBoundingClientRect();
  const d=Math.hypot(r.left+r.width/2-e.clientX,r.top+r.height/2-e.clientY);
  if(d<135)moveNoAway(e.clientX,e.clientY);
},{passive:true});

// Agreement -> backend notification
const yesBtn = document.getElementById("yesBtn");
const consentNote = document.getElementById("consentNote");
const successOverlay = document.getElementById("successOverlay");
const closeSuccess = document.getElementById("closeSuccess");

yesBtn.addEventListener("click", async () => {
  yesBtn.disabled = true;
  yesBtn.textContent = "Отправляю…";
  const payload = {
    answer: "yes",
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    page: location.href
  };

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("API error");
    consentNote.textContent = "Ответ отправлен ❤️";
  } catch (err) {
    // The UI still celebrates; backend can be connected later.
    consentNote.textContent = "Сервер пока не подключён — но я всё равно услышал ❤️";
  }

  successOverlay.classList.add("open");
  successOverlay.setAttribute("aria-hidden","false");
  document.body.classList.add("no-scroll");
  yesBtn.textContent = "Я согласна ❤️";
  yesBtn.disabled = false;
});

closeSuccess.addEventListener("click", () => {
  successOverlay.classList.remove("open");
  document.body.classList.remove("no-scroll");
});

// Header music toggle
const musicBtn = document.querySelector(".music-btn");
let audio = null;
musicBtn.addEventListener("click", () => {
  if (!audio) {
    audio = new Audio("assets/music.mp3");
    audio.loop = true;
  }
  if (audio.paused) {
    audio.play().catch(()=>{});
    musicBtn.textContent = "Ⅱ";
  } else {
    audio.pause();
    musicBtn.textContent = "♪";
  }
});

// Small floating petals
const petals = document.querySelector(".petals");
if (!prefersReduced) {
  for (let i=0;i<18;i++) {
    const p=document.createElement("i");
    p.style.left = `${Math.random()*100}%`;
    p.style.animationDelay = `${Math.random()*8}s`;
    p.style.animationDuration = `${8+Math.random()*10}s`;
    p.style.setProperty("--drift", `${(Math.random()*140-70)}px`);
    petals.appendChild(p);
  }
}
