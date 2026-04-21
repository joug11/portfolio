import { escapeHtml } from '../../../shared/js/utils/sanitize.js';

export class ExperienceRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(experience) {
    if (!this.container) return;

    const visible = experience
      .filter(e => e.visible)
      .sort((a, b) => a.order - b.order);

    if (!visible.length) {
      this.container.innerHTML = '<p class="no-content">경력 정보가 없습니다.</p>';
      return;
    }

    this.container.innerHTML = visible.map(exp => `
      <div class="timeline-item fade-in">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-period">${escapeHtml(exp.period)}</span>
          <ul class="timeline-list">
            ${(exp.items || []).map(item => `
              <li>
                ${escapeHtml(item.text)}
                ${item.sub ? `<span class="timeline-sub">${escapeHtml(item.sub)}</span>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }
}
