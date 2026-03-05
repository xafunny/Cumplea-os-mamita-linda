// ══════════════════════════════════════════════
//   PÉTALOS ANIMADOS — fondo de la tarjeta
// ══════════════════════════════════════════════

const canvas  = document.getElementById('petal-canvas');
const ctx     = canvas.getContext('2d');
let   petals  = [];

const PETAL_COLORS = [
  '#FF4757', '#FF6B81', '#C0392B',
  '#E84393', '#FF1744', '#FF6B8A', '#D4AF37'
];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createPetal() {
  return {
    x:           Math.random() * canvas.width,
    y:           -20,
    size:        6 + Math.random() * 12,
    speedY:      0.8 + Math.random() * 1.5,
    speedX:      (Math.random() - 0.5) * 1.5,
    rotation:    Math.random() * Math.PI * 2,
    rotSpeed:    (Math.random() - 0.5) * 0.06,
    color:       PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    opacity:     0.4 + Math.random() * 0.5,
    wobble:      Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.03,
  };
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle   = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (petals.length < 60 && Math.random() < 0.3) petals.push(createPetal());
  petals = petals.filter(p => p.y < canvas.height + 30);
  petals.forEach(p => {
    p.y        += p.speedY;
    p.wobble   += p.wobbleSpeed;
    p.x        += p.speedX + Math.sin(p.wobble) * 0.8;
    p.rotation += p.rotSpeed;
    drawPetal(p);
  });
  requestAnimationFrame(animatePetals);
}
animatePetals();


// ══════════════════════════════════════════════
//   ABRIR TARJETA — al pulsar el botón
// ══════════════════════════════════════════════

function openCard() {
  document.getElementById('intro').classList.add('hide');
  document.getElementById('main').classList.add('visible');

  setTimeout(() => {
    document.getElementById('intro').style.display = 'none';
  }, 1600);

  burstConfetti();

  // ── FIX MÚSICA: se reproduce al hacer clic en el botón ──
  const music = document.getElementById('bg-music');
  if (music) {
    music.currentTime = 0;
    music.volume = 0.5;
    music.play().catch(() => {
      // Si aún así lo bloquea, intenta al siguiente clic
      document.addEventListener('click', () => music.play(), { once: true });
    });
  }
}


// ══════════════════════════════════════════════
//   CONFETI — lluvia de emojis al abrir
// ══════════════════════════════════════════════

function burstConfetti() {
  const symbols = ['🌹', '🎉', '💕', '✨', '🌸', '💐', '🎊'];
  for (let i = 0; i < 40; i++) {
    const el       = document.createElement('div');
    const duration = 2 + Math.random() * 2;
    const delay    = Math.random() * 1.5;
    const size     = 1.5 + Math.random() * 1.5;
    el.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -30px;
      font-size: ${size}rem;
      animation: fall-confetti ${duration}s ease-in ${delay}s forwards;
      pointer-events: none;
      z-index: 200;
    `;
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (duration + delay + 0.5) * 1000);
  }
}


// ══════════════════════════════════════════════
//   CARGAR FOTOS — al seleccionar imagen
// ══════════════════════════════════════════════

function loadPhoto(input, frameId, uploadId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const frame  = document.getElementById(frameId);
    const upload = document.getElementById(uploadId);
    upload.style.display = 'none';
    const existing = frame.querySelector('img');
    if (existing) existing.remove();
    const img = document.createElement('img');
    img.src   = e.target.result;
    frame.insertBefore(img, frame.querySelector('.photo-label'));
    frame.onclick = null;
  };
  reader.readAsDataURL(file);
}


// ══════════════════════════════════════════════
//   SCROLL REVEAL — elementos aparecen al bajar
// ══════════════════════════════════════════════

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .reveal-letter').forEach(el => {
  observer.observe(el);
});


// ══════════════════════════════════════════════
//   CARRUSEL — pasa automáticamente con fade
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.getElementById('carouselDots');
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let timer;

  // ── FIX: asegurar que solo la primera slide esté activa al inicio ──
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === 0);
  });

  // Crear puntos de navegación
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      goTo(i);
      resetTimer();
    });
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startTimer() {
    timer = setInterval(next, 3500); // cambia cada 3.5 segundos
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  // Pausa al pasar el mouse
  const wrapper = document.querySelector('.carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(timer));
    wrapper.addEventListener('mouseleave', startTimer);
  }

  startTimer();
});