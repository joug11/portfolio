/* =============================================
   MAIN.JS — Portfolio Interactions
   ============================================= */

/* ─── 1. NAVBAR: 스크롤 시 blur 처리 ─────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 초기 실행
})();


/* ─── 2. HAMBURGER MENU ───────────────────────── */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  });

  // 메뉴 항목 클릭 시 닫기
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });
})();


/* ─── 3. SMOOTH SCROLL (네이티브 미지원 폴백) ──── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();


/* ─── 4. ACTIVE NAV LINK (스크롤 위치 기반) ───── */
(function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionIds = ['about', 'skills', 'projects', 'experience', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  if (!sections.length) return;

  function updateActive() {
    const scrollY   = window.scrollY;
    const viewH     = window.innerHeight;
    let   activeId  = '';

    sections.forEach(section => {
      const top    = section.offsetTop - viewH * 0.4;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        activeId = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();


/* ─── 5. TYPING ANIMATION (Hero) ─────────────── */
(function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const texts   = ['Backend Developer', 'DB Optimization Specialist', 'System Integrator'];
  let   tIdx    = 0;
  let   cIdx    = 0;
  let   isDeleting = false;
  let   timer   = null;

  function type() {
    const current = texts[tIdx];

    if (!isDeleting) {
      // 타이핑
      el.textContent = current.slice(0, cIdx + 1);
      cIdx++;
      if (cIdx === current.length) {
        // 다 썼으면 잠시 대기 후 삭제
        isDeleting = true;
        timer = setTimeout(type, 1800);
        return;
      }
      timer = setTimeout(type, 85);
    } else {
      // 삭제
      el.textContent = current.slice(0, cIdx - 1);
      cIdx--;
      if (cIdx === 0) {
        isDeleting = false;
        tIdx = (tIdx + 1) % texts.length;
        timer = setTimeout(type, 400);
        return;
      }
      timer = setTimeout(type, 45);
    }
  }

  // 0.8초 후 시작 (Hero fade-in 이후)
  setTimeout(type, 800);
})();


/* ─── 6. INTERSECTION OBSERVER (fade-in) ─────── */
(function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // 같은 section 내 여러 요소에 순차 딜레이
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, 0);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  // section 내 fade-in 요소들에 순차 딜레이 적용
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    const fadeEls = section.querySelectorAll('.fade-in');
    fadeEls.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.12}s`;
    });
  });

  elements.forEach(el => observer.observe(el));
})();


/* ─── 7. SKILLS TAB FILTER ───────────────────── */
(function initSkillsTabs() {
  const tabs       = document.querySelectorAll('.skills-tab');
  const categories = document.querySelectorAll('.skills-category');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.category;

      // 탭 활성화
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      // 카테고리 표시/숨김
      categories.forEach(cat => {
        const catName = cat.dataset.category;
        if (target === 'all' || catName === target) {
          cat.classList.remove('hidden');
          // 재진입 애니메이션
          cat.style.opacity    = '0';
          cat.style.transform  = 'translateY(12px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              cat.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              cat.style.opacity    = '1';
              cat.style.transform  = 'translateY(0)';
            });
          });
        } else {
          cat.classList.add('hidden');
        }
      });
    });
  });
})();


/* ─── 8. SCROLL TO TOP BUTTON ────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  function toggleBtn() {
    btn.classList.toggle('visible', window.scrollY > 300);
  }

  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ─── 9. PROJECT CARD 순차 딜레이 ────────────── */
(function initProjectCards() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card, i) => {
    // 그리드 열 위치에 따라 순차 딜레이 (PC 3열 기준)
    const col = i % 3;
    card.style.transitionDelay = `${col * 0.1}s`;
    card.style.transition = `transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease`;
  });
})();
