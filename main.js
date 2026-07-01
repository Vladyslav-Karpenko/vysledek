// ===== КАСТОМНЫЙ КУРСОР =====
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (cursor) {
    cursor.style.left = `${mouseX - 20}px`;
    cursor.style.top = `${mouseY - 20}px`;
  }
  if (cursorDot) {
    cursorDot.style.left = `${mouseX - 3}px`;
    cursorDot.style.top = `${mouseY - 3}px`;
  }
});

// Увеличение курсора на ссылках и кнопках
document.querySelectorAll('a, button, input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => cursor?.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => cursor?.classList.remove('cursor-hover'));
});

// ===== ПАРТИКЛЫ (Canvas) =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.4 + 0.1;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(168, 85, 247, ${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < 80; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // Линии между близкими частицами
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.06 * (1 - dist / 120)})`;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== GSAP АНИМАЦИИ =====
gsap.registerPlugin(ScrollTrigger);

// Reveal-элементы при скролле
document.querySelectorAll('.reveal-text').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0,
      duration: 0.8,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    }
  );
});

// Счётчики
document.querySelectorAll('.counter').forEach(counter => {
  const target = parseInt(counter.dataset.target);
  gsap.fromTo(counter,
    { innerText: 0 },
    {
      innerText: target,
      duration: 2,
      ease: 'power2.out',
      snap: { innerText: 1 },
      scrollTrigger: {
        trigger: counter,
        start: 'top 90%'
      }
    }
  );
});

// ===== ФОРМА (Formspree) =====
const form = document.getElementById('contact-form');
const messagesDiv = document.getElementById('form-messages');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const loadingSpinner = document.getElementById('loading-spinner');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('char-count');
let formData = {};

messageInput?.addEventListener('input', function () {
  const len = this.value.length;
  charCount.textContent = `${len}/800`;
  charCount.classList.toggle('text-yellow-500', len > 700);
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    offer: document.getElementById('offer').value.trim(),
    message: messageInput?.value.trim() || ''
  };

  submitBtn.disabled = true;
  submitText.textContent = 'Odesílám...';
  loadingSpinner.classList.remove('hidden');
  messagesDiv.innerHTML = '';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      messagesDiv.innerHTML = `
            <div class="formspree-success mb-6">
              <p class="font-semibold text-lg mb-1">✓ Nabídka přijata</p>
              <p class="text-sm opacity-80">Brzy se vám ozvu s odpovědí.</p>
            </div>`;
      form.reset();
      charCount.textContent = '0/800';
      gsap.fromTo('.formspree-success', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
    } else {
      const data = await response.json();
      const msg = data.errors ? Object.values(data.errors).flat().join('. ') : 'Chyba při odesílání.';
      messagesDiv.innerHTML = `<div class="formspree-error mb-6"><p class="font-semibold">✗ ${msg}</p></div>`;
    }
  } catch {
    messagesDiv.innerHTML = `<div class="formspree-error mb-6"><p class="font-semibold">✗ Síťová chyba. Zkuste to prosím znovu.</p></div>`;
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Odeslat nabídku';
    loadingSpinner.classList.add('hidden');
  }
});