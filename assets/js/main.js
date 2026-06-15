// ── PARTICLES ──
(function(){
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const COLORS = ['rgba(107,136,145,', 'rgba(184,197,204,', 'rgba(196,181,160,'];

  for(let i = 0; i < 55; i++){
    particles.push({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      r: Math.random() * 2.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18 - 0.06,
      alpha: Math.random() * 0.45 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012,
    });
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    const scrollY = window.scrollY;
    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, (p.y - scrollY * 0.08) % (H + 100), p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + a + ')';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < -10) p.x = W + 10;
      if(p.x > W + 10) p.x = -10;
      if(p.y < -40) p.y = H + 40;
      if(p.y > H + 1200) p.y = -40;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('in');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
reveals.forEach(el => obs.observe(el));

// stagger cards
document.querySelectorAll('.cards-grid .card').forEach((c,i) => c.style.transitionDelay = `${i*55}ms`);
document.querySelectorAll('.mirror-item').forEach((m,i) => m.style.transitionDelay = `${i*35}ms`);


// ── BURGER ──
(function(){
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  var backdrop = document.getElementById('menu-backdrop');
  function open(){ burger.classList.add('open'); menu.classList.add('open'); document.body.style.overflow='hidden'; }
  function close(){ burger.classList.remove('open'); menu.classList.remove('open'); document.body.style.overflow=''; }
  burger.addEventListener('click', function(){ menu.classList.contains('open') ? close() : open(); });
  backdrop.addEventListener('click', close);
  document.querySelectorAll('.mobile-nav-link, .mobile-menu-cta a').forEach(function(link){
    link.addEventListener('click', close);
  });
})();

// ── FREE PRACTICE MODAL ──
(function(){
  var modal = document.getElementById('free-practice-modal');
  if(!modal) return;

  var triggers = document.querySelectorAll('.js-free-practice-modal');
  var closeButtons = modal.querySelectorAll('[data-modal-close]');
  var panel = modal.querySelector('.free-practice-modal-panel');
  var previousFocus = null;

  function openModal(event){
    if(event) event.preventDefault();
    if(typeof window.trackGoogleEvent === 'function') {
      window.trackGoogleEvent('free_practice_click', {
        link_text: event && event.currentTarget ? event.currentTarget.textContent.trim() : '',
        link_url: event && event.currentTarget ? event.currentTarget.href : '#free-practice'
      });
    }
    if(typeof window.trackMetaCustomEvent === 'function') {
      window.trackMetaCustomEvent('FreePracticeClick', {
        link_text: event && event.currentTarget ? event.currentTarget.textContent.trim() : ''
      });
    }
    previousFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var firstInput = modal.querySelector('input, textarea, select, button, a');
    setTimeout(function(){
      (firstInput || panel).focus();
    }, 80);
  }

  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  triggers.forEach(function(trigger){
    trigger.addEventListener('click', openModal);
  });

  closeButtons.forEach(function(button){
    button.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function(event){
    if(event.key === 'Escape' && modal.classList.contains('open')){
      closeModal();
    }
  });
})();

// ── AUDIO PREVIEW PLAYER ──
(function(){
  var player = document.querySelector('[data-audio-player]');
  if(!player) return;

  var audio = player.querySelector('audio');
  var toggle = player.querySelector('[data-audio-toggle]');
  var progress = player.querySelector('[data-audio-progress]');
  var seek = player.querySelector('[data-audio-seek]');
  var time = player.querySelector('[data-audio-time]');

  function formatTime(value){
    if(!Number.isFinite(value)) return '0:00';
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60).toString().padStart(2, '0');
    return minutes + ':' + seconds;
  }

  function updateProgress(){
    var duration = audio.duration || 0;
    var percent = duration ? (audio.currentTime / duration) * 100 : 0;
    progress.style.width = percent + '%';
    seek.setAttribute('aria-valuenow', Math.round(percent));
    time.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(duration);
  }

  function seekTo(clientX){
    var rect = seek.getBoundingClientRect();
    var ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    if(audio.duration) {
      audio.currentTime = audio.duration * ratio;
    }
  }

  toggle.addEventListener('click', function(){
    if(audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  seek.addEventListener('click', function(event){
    seekTo(event.clientX);
  });

  seek.addEventListener('keydown', function(event){
    if(event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    var step = event.key === 'ArrowRight' ? 5 : -5;
    audio.currentTime = Math.min(Math.max(audio.currentTime + step, 0), audio.duration || 0);
  });

  audio.addEventListener('loadedmetadata', updateProgress);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('play', function(){
    player.classList.add('playing');
    toggle.setAttribute('aria-label', 'Pause audio preview');
  });
  audio.addEventListener('pause', function(){
    player.classList.remove('playing');
    toggle.setAttribute('aria-label', 'Play audio preview');
  });
  audio.addEventListener('ended', function(){
    player.classList.remove('playing');
    audio.currentTime = 0;
    updateProgress();
  });
  updateProgress();
})();

// ── BREATH LABEL CYCLE ──
const label = document.querySelector('.breath-label');
if(label){
  const cycle = ['inhale', '', 'exhale', ''];
  const durations = [2200, 500, 2200, 600];
  let idx = 0;
  function next(){
    label.textContent = cycle[idx];
    label.style.opacity = cycle[idx] ? '1' : '0';
    setTimeout(() => { idx = (idx+1) % cycle.length; next(); }, durations[idx]);
  }
  next();
}
