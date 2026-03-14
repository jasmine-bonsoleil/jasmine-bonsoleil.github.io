// ===================================
// Jasmine HP — app.js
// Data particle background + counters
// ===================================

// ─── Background particle network ───
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const PARTICLE_COUNT = 60;
const AMBER = 'rgba(212, 168, 67,';
const BLUE  = 'rgba(100, 140, 220,';

function randomParticle() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5,
    color: Math.random() > 0.7 ? AMBER : BLUE,
  };
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(randomParticle());

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const alpha = (1 - dist / 150) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(100, 140, 220, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Draw particles
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color + '0.6)';
    ctx.fill();
  }
}

function updateParticles() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
  }
}

function loop() {
  updateParticles();
  drawParticles();
  requestAnimationFrame(loop);
}
loop();

// ─── Journal ────────────────────────
fetch('journal.json')
  .then(r => r.json())
  .then(articles => {
    const grid = document.getElementById('journal-grid');
    articles.forEach(a => {
      const card = document.createElement('a');
      card.className = 'journal-card';
      card.href = a.url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.innerHTML = `
        <img class="journal-card-img" src="${a.eyecatch}" alt="${a.title}">
        <div class="journal-card-body">
          <div class="journal-card-date">${a.date}</div>
          <div class="journal-card-title">${a.title}</div>
          <p class="journal-card-excerpt">${a.excerpt}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  });

// ─── Number counter animation ───────
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const isLarge = target > 999;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(ease * target);
    el.textContent = isLarge
      ? current.toLocaleString()
      : current;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Trigger when hero is visible
const dataCards = document.querySelectorAll('.data-card');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const valueEl = entry.target.querySelector('.dc-value');
      const target = parseInt(valueEl.dataset.target, 10);
      animateCounter(valueEl, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

dataCards.forEach(card => counterObserver.observe(card));

// ─── Subtle scroll fade-in ──────────
const fadeEls = document.querySelectorAll('.work-card, .ph-item, .stat-row');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
  fadeObserver.observe(el);
});
