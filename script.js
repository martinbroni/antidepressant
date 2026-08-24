const preloader=document.querySelector(".preloader"),percent=document.querySelector(".preloader__percent"),line=document.querySelector(".preloader__line span");
let n=0; const loader=setInterval(()=>{n+=Math.floor(Math.random()*9)+3;if(n>=100){n=100;clearInterval(loader);setTimeout(()=>preloader.classList.add("done"),350)}percent.textContent=n;line.style.width=n+"%"},55);

const menuToggle=document.querySelector(".menu-toggle"),mobileMenu=document.querySelector(".mobile-menu");
function toggleMenu(open){mobileMenu.classList.toggle("open",open);document.body.classList.toggle("menu-open",open);menuToggle.setAttribute("aria-expanded",open)}
menuToggle.addEventListener("click",()=>toggleMenu(!mobileMenu.classList.contains("open")));
document.querySelectorAll(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>toggleMenu(false)));

const reveals=document.querySelectorAll(".reveal");
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.12,rootMargin:"0px 0px -5% 0px"});
reveals.forEach(e=>observer.observe(e));

// Thought videos: their own sound takes priority over background music.
const bgMusic=document.getElementById("bgMusic");
let musicWasPlayingBeforeThought=false;
let activeThoughtVideo=null;

function stopOtherThoughtVideos(except){
  document.querySelectorAll(".thought__media video").forEach(v=>{
    if(v!==except){
      v.pause();
      v.muted=true;
      const b=v.closest(".thought__media")?.querySelector(".play-btn");
      if(b)b.textContent="смотреть";
    }
  });
}

async function playThought(video, button){
  stopOtherThoughtVideos(video);
  if(!bgMusic.paused){
    musicWasPlayingBeforeThought=true;
    bgMusic.pause();
  }
  activeThoughtVideo=video;
  video.muted=false;
  video.volume=1;
  try{
    await video.play();
    if(button)button.textContent="пауза";
  }catch(e){
    // If the browser blocks autoplay with sound, start muted and unmute on interaction.
    video.muted=true;
    try{await video.play();}catch(_){}
    if(button)button.textContent="включить звук";
  }
}

function stopThought(video, button){
  video.pause();
  video.currentTime=0;
  video.muted=true;
  if(button)button.textContent="смотреть";
  if(activeThoughtVideo===video)activeThoughtVideo=null;
  if(musicWasPlayingBeforeThought){
    bgMusic.play().catch(()=>{});
    const sound=document.querySelector(".sound-control");
    sound?.classList.add("playing");
    const label=sound?.querySelector(".sound-text");
    if(label)label.textContent="звук вкл.";
    musicWasPlayingBeforeThought=false;
  }
}

document.querySelectorAll(".thought__media").forEach(card=>{
  const video=card.querySelector("video"), button=card.querySelector(".play-btn");
  if(!video||!button)return;
  button.addEventListener("click",()=>{
    if(video.paused)playThought(video,button);
    else {
      video.pause();
      video.muted=true;
      button.textContent="смотреть";
      if(musicWasPlayingBeforeThought){
        bgMusic.play().catch(()=>{});
        document.querySelector(".sound-control")?.classList.add("playing");
        musicWasPlayingBeforeThought=false;
      }
    }
  });
});

const thoughtVisibilityObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    const video=entry.target.querySelector("video");
    const button=entry.target.querySelector(".play-btn");
    if(!video)return;
    if(entry.isIntersecting && entry.intersectionRatio>=0.55){
      playThought(video,button);
    }else if(!entry.isIntersecting && activeThoughtVideo===video){
      stopThought(video,button);
    }
  });
},{threshold:[0,.55,.8]});

document.querySelectorAll(".thought__media").forEach(card=>thoughtVisibilityObserver.observe(card));

const heroVideo=document.querySelector(".hero__video");
const clamp=(v,min,max)=>Math.min(Math.max(v,min),max);
window.addEventListener("mousemove",e=>{
 if(!heroVideo||window.innerWidth<700)return;
 const x=50+(e.clientX/window.innerWidth-.5)*5;
 const y=42+(e.clientY/window.innerHeight-.5)*3;
 heroVideo.style.objectPosition=`${clamp(x,45,55)}% ${clamp(y,38,46)}%`;
},{passive:true});

const cursor=document.querySelector(".cursor"),cursorLabel=document.querySelector(".cursor--label");
let mx=0,my=0,cx=0,cy=0;
window.addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY},{passive:true});
(function cursorLoop(){cx+=(mx-cx)*.16;cy+=(my-cy)*.16;cursor.style.left=cx+"px";cursor.style.top=cy+"px";cursorLabel.style.left=cx+"px";cursorLabel.style.top=cy+"px";requestAnimationFrame(cursorLoop)})();
document.querySelectorAll("a,button,.moment,.thought__media").forEach(el=>{
 el.addEventListener("mouseenter",()=>{
   cursor.classList.add("hover");
   const label=el.dataset.cursor || (el.matches(".thought__media")?"PLAY":"");
   if(label){cursor.classList.add("label-active");cursorLabel.textContent=label}
 });
 el.addEventListener("mouseleave",()=>{cursor.classList.remove("hover","label-active");cursorLabel.textContent=""});
});

document.querySelectorAll(".magnetic-btn").forEach(btn=>{
 btn.addEventListener("mousemove",e=>{
   if(innerWidth<900)return;
   const r=btn.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.12,y=(e.clientY-r.top-r.height/2)*.12;
   btn.style.transform=`translate(${x}px,${y}px)`;
 });
 btn.addEventListener("mouseleave",()=>btn.style.transform="");
});

const audio=bgMusic,sound=document.querySelector(".sound-control");
sound.addEventListener("click",async()=>{
 if(audio.paused){try{await audio.play();sound.classList.add("playing");sound.querySelector(".sound-text").textContent="sound on"}catch(e){}}else{audio.pause();sound.classList.remove("playing");sound.querySelector(".sound-text").textContent="sound off"}
});

// Try to start the soundtrack immediately. Modern browsers may block
// unmuted autoplay; in that case the first user interaction starts it.
audio.volume = 0.42;
window.addEventListener("load", async ()=>{
  try{
    await audio.play();
    sound.classList.add("playing");
    sound.querySelector(".sound-text").textContent="звук вкл.";
  }catch(e){
    const resume=async ()=>{
      try{
        await audio.play();
        sound.classList.add("playing");
        sound.querySelector(".sound-text").textContent="звук вкл.";
      }catch(_){}
      window.removeEventListener("pointerdown",resume);
      window.removeEventListener("keydown",resume);
      window.removeEventListener("touchstart",resume);
    };
    window.addEventListener("pointerdown",resume,{once:true});
    window.addEventListener("keydown",resume,{once:true});
    window.addEventListener("touchstart",resume,{once:true});
  }
});



document.querySelectorAll(".moment video").forEach(v=>{v.addEventListener("mouseenter",()=>v.play().catch(()=>{}));v.addEventListener("mouseleave",()=>v.pause())});


// Glass header contrast: dark glass over media, warm glass over light sections.
const siteHeader=document.querySelector(".site-header");
const contrastTargets=document.querySelectorAll(".story,.thoughts,.goals,.instagram,.contact");
const headerObserver=new IntersectionObserver(entries=>{
  const light=entries.some(e=>e.isIntersecting && !e.target.classList.contains("story"));
  siteHeader.classList.toggle("is-light",light);
},{threshold:.2});
contrastTargets.forEach(section=>headerObserver.observe(section));

// Keep the hero video playing as a true background layer.
const heroMedia=document.querySelector(".hero__video");
if(heroMedia){
  heroMedia.muted=true;
  heroMedia.playsInline=true;
  heroMedia.loop=true;
  const startHero=()=>heroMedia.play().catch(()=>{});
  window.addEventListener("load",startHero);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)startHero()});
}
