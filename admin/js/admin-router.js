export class AdminRouter {
  constructor(routes) {
    this.routes = routes;
    this._current = null;
  }

  init() {
    window.addEventListener('hashchange', () => this._handle());
    this._handle();
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  _handle() {
    const hash    = window.location.hash || '#/profile';
    const handler = this.routes[hash];

    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === hash);
    });

    const titleEl = document.getElementById('adminPageTitle');
    if (titleEl) {
      const titles = {
        '#/profile':    '프로필 관리',
        '#/projects':   '프로젝트 관리',
        '#/skills':     '스킬 관리',
        '#/experience': '경력 관리',
        '#/settings':   'GitHub 설정',
      };
      titleEl.textContent = titles[hash] || '관리자';
    }

    if (handler) handler();
  }
}
