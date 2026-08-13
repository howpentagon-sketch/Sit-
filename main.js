// Основная логика сцен, typing-эффект, интерактивный конверт и финальная анимация
const q = sel => document.querySelector(sel);
const qa = sel => Array.from(document.querySelectorAll(sel));

/* Utilities */
function wait(ms){ return new Promise(res => setTimeout(res, ms)); }

/* Scene switching with smooth transitions */
async function goToScene(currentEl, nextEl){
  if(!currentEl) return;
  currentEl.classList.remove('active');
  // blur & fade out
  currentEl.style.filter = 'blur(6px)';
  currentEl.style.opacity = '0';
  await wait(420);
  currentEl.hidden = true;
  currentEl.style.filter = '';
  currentEl.style.opacity = '';

  nextEl.hidden = false;
  await wait(30);
  nextEl.classList.add('active');
  // small entrance animation handled by CSS
}

/* Floating subtle hearts generator (a few, lightweight) */
function spawnFloatingHearts(container = document.getElementById('floating-hearts'), count = 10){
  const max = count;
  for(let i=0;i<max;i++){
    const el = document.createElement('div');
    el.className = 'heart';
    // Random small sizes
    const size = Math.round(8 + Math.random()*16);
    el.style.width = el.style.height = `${size}px`;
    el.style.left = `${5 + Math.random()*90}%`;
    el.style.top = `${10 + Math.random()*70}%`;
    el.style.opacity = (0.12 + Math.random()*0.6).toString();
    el.style.transform = `translate3d(0,0,0) scale(${0.9 + Math.random()*0.4}) rotate(${Math.random()*40 - 20}deg)`;
    container.appendChild(el);
    // gentle float animation using JS to avoid heavy CSS keyframes for many elements
    animateFloating(el);
  }
  // keep only a few hearts (cleanup)
  setInterval(()=> {
    if(container.children.length > max) container.removeChild(container.firstChild);
  }, 5000);
}

function animateFloating(el){
  const dur = 8000 + Math.random()*12000;
  const dx = (Math.random()*40 - 20);
  const dy = (Math.random()*20 - 10);
  el.animate([
    { transform: `translate3d(0,0,0) translate(${0}px, ${0}px)` },
    { transform: `translate3d(0,0,0) translate(${dx}px, ${dy}px)` },
    { transform: `translate3d(0,0,0) translate(${dx/2}px, ${dy*1.2}px)` },
    { transform: `translate3d(0,0,0) translate(0px, ${0}px)` }
  ], {
    duration: dur,
    iterations: Infinity,
    direction: 'alternate',
    easing: 'ease-in-out'
  });
}

/* Initial scene behaviors */
document.addEventListener('DOMContentLoaded', async ()=>{
  // Spawn a modest number of hearts
  spawnFloatingHearts(null, 12);

  // small delayed appearance for S1 elements (giving the "arise from cloud" effect)
  const s1 = q('#scene-1');
  s1.classList.add('active');
  // animate headline: glow, scale
  const headline = q('#s1-title');
  headline.style.opacity = 0;
  headline.style.transform = 'scale(0.92)';
  await wait(240);
  headline.animate([{opacity:0, transform:'scale(0.92)'},{opacity:1, transform:'scale(1.02)'},{opacity:1, transform:'scale(1)'}], {duration:900, easing:'cubic-bezier(.2,.9,.25,1)'});
  headline.style.opacity = 1;
  headline.style.transform = '';

  // reveal subtext & button
  await wait(420);
  const sub = s1.querySelector('.subtext');
  sub.animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}], {duration:700});
  sub.style.opacity = 1;

  await wait(500);
  const btn = s1.querySelector('.btn');
  btn.animate([{opacity:0, transform:'translateY(16px) scale(.98)'},{opacity:1, transform:'translateY(0) scale(1)'}], {duration:700, easing:'cubic-bezier(.2,.9,.25,1)'});
});

/* Buttons to navigate scenes */
qa('.btn[data-next]').forEach(b=>{
  b.addEventListener('click', async (e)=>{
    const nextId = b.dataset.next;
    const current = b.closest('.scene');
    const next = q(`#${nextId}`);
    await goToScene(current, next);

    // special logic after entering scene 2: start typing
    if(nextId === 'scene-2'){
      startTyping();
    }
  });
});

/* Typing effect for scene 2 */
const s2Text = `Все 217 дней моя любовь к тебе становилась только сильнее.`;
async function startTyping(){
  const container = q('#scene-2 .typing-text');
  container.textContent = '';
  const btn = q('#s2-next');
  btn.hidden = true;

  for(let i=0;i<s2Text.length;i++){
    container.textContent += s2Text[i];
    // occasionally spawn a tiny heart near text
    if(Math.random() < 0.06){
      const h = document.createElement('div');
      h.className = 'heart';
      h.style.width = h.style.height = `${8 + Math.random()*10}px`;
      // position it near center softly
      const wrap = q('#scene-2 .scene-inner');
      wrap.appendChild(h);
      h.style.position = 'absolute';
      h.style.left = `${40 + Math.random()*20}%`;
      h.style.top = `${30 + Math.random()*40}%`;
      h.style.opacity = 0.12 + Math.random()*0.6;
      animateFloating(h);
      // remove after while
      setTimeout(()=> h.remove(), 7000);
    }
    await wait(35 + Math.random()*40);
  }

  // small pause then reveal button
  await wait(500);
  btn.hidden = false;
  btn.animate([{opacity:0, transform:'translateY(12px)'},{opacity:1, transform:'translateY(0)'}], {duration:600, easing:'cubic-bezier(.2,.9,.25,1)'});
}

/* Scene 3: open letter interaction */
const openLetterBtn = q('#open-letter-btn');
const letterOverlay = q('#letter-scene');
const envelope = q('#envelope');
const note = q('#note');
const acceptBtn = q('#accept-btn');

openLetterBtn?.addEventListener('click', async ()=>{
  // go to overlay
  letterOverlay.hidden = false;
  // small enter animation
  letterOverlay.animate([{opacity:0},{opacity:1}], {duration:420});
  // gentle pop of envelope
  envelope.style.transform = 'scale(0.96)';
  envelope.animate([{transform:'scale(0.96)'},{transform:'scale(1.02)'},{transform:'scale(1)'}], {duration:550, easing:'cubic-bezier(.2,.9,.25,1)'});
  envelope.focus();
});

/* envelope open animation */
async function openEnvelope(){
  // flap up
  const flap = envelope.querySelector('.flap');
  flap.style.transformOrigin = 'center top';
  flap.animate([{transform:'rotateX(0deg)'},{transform:'rotateX(-120deg)'}], {duration:700, fill:'forwards', easing:'cubic-bezier(.2,.9,.25,1)'});
  // move heart seal down and fade
  const seal = envelope.querySelector('.heart-seal');
  seal.animate([{transform:'translateY(0)'},{transform:'translateY(12px) scale(.96)', opacity:0}], {duration:520, easing:'ease-in'});
  // envelope body reveal
  await wait(480);
  // bring note out
  note.hidden = false;
  const noteCard = q('.note-card');
  noteCard.style.transform = 'translateY(18px) scale(.98)';
  noteCard.animate([{opacity:0, transform:'translateY(18px) scale(.98)'},{opacity:1, transform:'translateY(0) scale(1)'}], {duration:640, easing:'cubic-bezier(.2,.9,.25,1)'});
  // subtle focus
  noteCard.animate([{boxShadow:'0 0 0 rgba(0,0,0,0)'},{boxShadow:'0 18px 60px rgba(255,140,175,0.12)'}], {duration:900, delay:120});
  // small hearts around
  for(let i=0;i<6;i++){
    const h = document.createElement('div');
    h.className = 'heart';
    h.style.width = h.style.height = `${8 + Math.random()*12}px`;
    document.body.appendChild(h);
    h.style.left = `${45 + Math.random()*10}%`;
    h.style.top = `${48 + Math.random()*10}%`;
    h.style.opacity = 0.14 + Math.random()*0.6;
    animateFloating(h);
    setTimeout(()=>h.remove(), 5000);
  }
}

/* click handlers for envelope */
envelope.addEventListener('click', ()=> openEnvelope());
envelope.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openEnvelope(); }
});

/* Accept button -> final animation */
acceptBtn?.addEventListener('click', async ()=>{
  // hide letter overlay
  letterOverlay.hidden = true;

  // transition to final scene
  const current = qa('.scene').find(s => s.classList.contains('active'));
  const final = q('#scene-final');
  await goToScene(current, final);

  // Final animation: lots of hearts, larger ones float up
  spawnFinalHearts();
});

/* Spawn final hearts and gentle lights */
function spawnFinalHearts(){
  const container = q('#final-hearts');
  container.innerHTML = '';
  container.style.pointerEvents = 'none';
  // many little hearts
  for(let i=0;i<28;i++){
    const h = document.createElement('div');
    h.className = 'heart';
    const size = 8 + Math.random()*36;
    h.style.width = h.style.height = `${size}px`;
    h.style.left = `${10 + Math.random()*80}%`;
    h.style.top = `${60 + Math.random()*30}%`;
    h.style.opacity = 0.7 - Math.random()*0.5;
    container.appendChild(h);
    // animate upwards
    const dur = 4200 + Math.random()*2000;
    const dx = Math.random()*80 - 40;
    h.animate([
      { transform: `translate3d(0,0,0) scale(${0.9 + Math.random()})`, opacity: h.style.opacity },
      { transform: `translate3d(${dx}px, -${200 + Math.random()*260}px, 0) scale(1.05)`, opacity: 0.06 }
    ], {
      duration: dur,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      iterations: 1,
      fill: 'forwards'
    });
  }

  // a few larger hearts that pop
  for(let i=0;i<5;i++){
    const big = document.createElement('div');
    big.className = 'heart';
    const size = 46 + Math.random()*34;
    big.style.width = big.style.height = `${size}px`;
    big.style.left = `${30 + Math.random()*40}%`;
    big.style.top = `${50 + Math.random()*18}%`;
    big.style.opacity = 0.95;
    big.style.borderRadius = '50%';
    big.style.filter = 'blur(0.3px)';
    big.style.background = `linear-gradient(180deg, #ff6fa7, #ff3f85)`;
    container.appendChild(big);
    big.animate([
      { transform: 'scale(0.6)', opacity:0 },
      { transform: 'scale(1.05)', opacity:1 },
      { transform: 'translateY(-160px) scale(1.1)', opacity:0.02 }
    ], { duration: 2200 + Math.random()*1200, easing:'cubic-bezier(.2,.8,.2,1)' });
  }

  // gentle background brighten
  document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.08)'}], {duration:1200, fill:'forwards'});

  // small sparkle hearts continue for a bit
  setTimeout(()=> spawnFloatingHearts(null, 10), 120);
}

//
// Small helper to find first matching in array (for goToScene)
//
Array.prototype.find = function(predicate){
  for(const v of this) if(predicate(v)) return v;
  return undefined;
};
