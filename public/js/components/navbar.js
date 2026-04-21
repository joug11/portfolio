export class Navbar {
  constructor(navbarId, menuId, hamburgerId) {
    this.navbar    = document.getElementById(navbarId);
    this.menu      = document.getElementById(menuId);
    this.hamburger = document.getElementById(hamburgerId);
  }

  init() {
    if (!this.navbar) return;
    this._initScroll();
    this._initHamburger();
    this._initSmoothScroll();
    this._initActiveNav();
  }

  _initScroll() {
    const onScroll = () => {
      this.navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  _initHamburger() {
    const { hamburger, menu } = this;
    if (!hamburger || !menu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      menu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });

    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menu.classList.remove('open');
      });
    });
  }

  _initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  _initActiveNav() {
    const navLinks  = document.querySelectorAll('.nav-link');
    const sectionIds = ['about', 'skills', 'projects', 'experience', 'contact'];
    const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const updateActive = () => {
      const scrollY  = window.scrollY;
      const viewH    = window.innerHeight;
      let   activeId = '';

      sections.forEach(section => {
        const top    = section.offsetTop - viewH * 0.4;
        const bottom = top + section.offsetHeight;
        if (scrollY >= top && scrollY < bottom) activeId = section.id;
      });

      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
      });
    };

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }
}
