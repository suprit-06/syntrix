/* ============================================
   LIQUID GLASS — White & Black Minimalist
   Advanced Scroll Animations & Depth Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  injectScrollProgress();
  initCursorGlow();
  initScrollReveal();
  initScrollParallax();
  initParallax3D();
  initNavigation();
  initCounterAnimation();
  initFormHandler();
  initSmoothScroll();
  initTiltCards();
  initSectionDividers();
  initScrollDepthCards();
});

/* --- Scroll Progress Bar --- */
function injectScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.id = 'scrollProgress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = progress + '%';
  }, { passive: true });
}

/* --- Cursor Glow Effect --- */
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow || window.innerWidth < 768) return;

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }

  animateGlow();
}

/* --- Enhanced Scroll Reveal Animation --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -80px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* --- Scroll-Driven Parallax Depth --- */
function initScrollParallax() {
  if (window.innerWidth < 768) return;

  const sections = document.querySelectorAll('.section');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      const offset = (sectionCenter - viewCenter) / window.innerHeight;

      // Subtle depth shift based on scroll position
      const cards = section.querySelectorAll('.glass--liquid');
      cards.forEach((card, i) => {
        const factor = 0.5 + (i * 0.15);
        const y = offset * factor * 15;
        const scale = 1 - Math.abs(offset) * 0.02;
        card.style.transform = `translateY(${y}px) scale(${Math.max(scale, 0.96)})`;
      });

      // Section header parallax
      const header = section.querySelector('.section__header');
      if (header) {
        header.style.transform = `translateY(${offset * 8}px)`;
      }
    });
  }, { passive: true });
}

/* --- Section Dividers (injected dynamically) --- */
function initSectionDividers() {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    const header = section.querySelector('.section__header');
    if (header) {
      const divider = document.createElement('div');
      divider.className = 'section-divider reveal';
      header.insertBefore(divider, header.querySelector('.section__title'));

      // Observe divider
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(divider);
    }
  });
}

/* --- Scroll Depth on Glass Cards --- */
function initScrollDepthCards() {
  if (window.innerWidth < 768) return;

  const cards = document.querySelectorAll('.glass--liquid');
  
  window.addEventListener('scroll', () => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (visible) {
        const progress = 1 - (rect.top / window.innerHeight);
        const clampedProgress = Math.max(0, Math.min(1, progress));
        
        // Dynamic shadow depth based on scroll
        const shadowBlur = 20 + clampedProgress * 40;
        const shadowSpread = 0.04 + clampedProgress * 0.04;
        card.style.boxShadow = `
          0 ${8 + clampedProgress * 12}px ${shadowBlur}px rgba(0, 0, 0, ${shadowSpread}),
          0 ${2 + clampedProgress * 4}px ${8 + clampedProgress * 8}px rgba(0, 0, 0, 0.03),
          inset 0 1px 0 rgba(255, 255, 255, ${0.6 + clampedProgress * 0.3})
        `;
      }
    });
  }, { passive: true });
}

/* --- 3D Parallax on Hero --- */
function initParallax3D() {
  const scene = document.querySelector('.hero__scene');
  if (!scene || window.innerWidth < 768) return;

  const card = scene.querySelector('.hero__3d-card');
  const floats = scene.querySelectorAll('.hero__float');
  const textElements = scene.querySelectorAll('.hero__badge, .hero__title, .hero__subtitle, .hero__actions');

  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;

  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    targetRotateY = (mouseX / rect.width) * 20;
    targetRotateX = -(mouseY / rect.height) * 15;
  });

  scene.addEventListener('mouseleave', () => {
    targetRotateX = 0;
    targetRotateY = 0;
  });

  function animate3D() {
    currentRotateX += (targetRotateX - currentRotateX) * 0.06;
    currentRotateY += (targetRotateY - currentRotateY) * 0.06;

    if (card) {
      card.style.transform = `rotateY(${currentRotateY * 0.8 - 8}deg) rotateX(${currentRotateX * 0.8 + 5}deg)`;
    }

    floats.forEach((el, i) => {
      const factor = 1 + i * 0.3;
      el.style.transform = `translateZ(${60 + i * 20}px) translateX(${currentRotateY * factor}px) translateY(${currentRotateX * factor}px)`;
    });

    textElements.forEach((el, i) => {
      const factor = 0.3 + i * 0.15;
      el.style.transform = `translateZ(${15 + i * 8}px) translateX(${currentRotateY * factor}px) translateY(${currentRotateX * factor}px)`;
    });

    requestAnimationFrame(animate3D);
  }

  animate3D();
}

/* --- Navigation --- */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  const navLinks = document.querySelectorAll('.nav__link');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    lastScroll = currentScroll;
  });

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('nav__links--open');
      toggle.classList.toggle('nav__toggle--active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('nav__links--open');
        toggle.classList.remove('nav__toggle--active');
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('nav__link--active'));
        const activeLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
        if (activeLink) activeLink.classList.add('nav__link--active');
      }
    });
  });
}

/* --- Counter Animation --- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    const current = Math.round(eased * target);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* --- Form Handler --- */
function initFormHandler() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('.form__submit');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<span>✓ Message Sent!</span>';
    btn.style.background = '#1a1a1a';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

/* --- Smooth Scroll --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --- Tilt Effect on Cards --- */
function initTiltCards() {
  const cards = document.querySelectorAll('.service-card, .portfolio-card, .stat-card');
  if (window.innerWidth < 768) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;

      // Move inner light refraction
      if (card.classList.contains('glass--liquid')) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        card.style.setProperty('--light-x', percentX + '%');
        card.style.setProperty('--light-y', percentY + '%');
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    });
  });
}
