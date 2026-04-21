import { escapeHtml } from '../../../shared/js/utils/sanitize.js';

export class SkillsRenderer {
  constructor(tabsId, gridId) {
    this.tabsEl = document.getElementById(tabsId);
    this.gridEl = document.getElementById(gridId);
  }

  render(skills) {
    if (!this.tabsEl || !this.gridEl) return;

    const visible = skills
      .filter(s => s.visible)
      .sort((a, b) => a.order - b.order);

    this._renderTabs(visible);
    this._renderGrid(visible);
  }

  _renderTabs(skills) {
    const tabs = [
      `<button class="skills-tab active" data-category="all" role="tab" aria-selected="true">All</button>`,
      ...skills.map(s =>
        `<button class="skills-tab" data-category="${escapeHtml(s.category)}" role="tab" aria-selected="false">${escapeHtml(s.label)}</button>`
      )
    ].join('');
    this.tabsEl.innerHTML = tabs;
  }

  _renderGrid(skills) {
    this.gridEl.innerHTML = skills.map(cat => `
      <div class="skills-category" data-category="${escapeHtml(cat.category)}">
        <h3 class="skills-cat-label">${escapeHtml(cat.label)}</h3>
        <div class="skills-tags">
          ${cat.items.map(item => `<span class="skill-tag">${escapeHtml(item.name)}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  initTabs() {
    if (!this.tabsEl || !this.gridEl) return;

    this.tabsEl.addEventListener('click', e => {
      const tab = e.target.closest('.skills-tab');
      if (!tab) return;

      const target = tab.dataset.category;

      this.tabsEl.querySelectorAll('.skills-tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      this.gridEl.querySelectorAll('.skills-category').forEach(cat => {
        const match = target === 'all' || cat.dataset.category === target;
        if (match) {
          cat.classList.remove('hidden');
          cat.style.opacity   = '0';
          cat.style.transform = 'translateY(12px)';
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
  }
}
