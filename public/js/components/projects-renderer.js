import { escapeHtml, sanitizeUrl } from '../../../shared/js/utils/sanitize.js';

export class ProjectsRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(projects) {
    if (!this.container) return;

    const visible = projects
      .filter(p => p.visible)
      .sort((a, b) => a.order - b.order);

    if (!visible.length) {
      this.container.innerHTML = '<p class="no-content">프로젝트가 없습니다.</p>';
      return;
    }

    this.container.innerHTML = visible
      .map((p, i) => this.buildCard(p, i))
      .join('');

    this.container.querySelectorAll('.project-card').forEach((card, i) => {
      card.classList.add('fade-in');
      card.style.transitionDelay = `${(i % 3) * 0.1}s`;
    });
  }

  buildCard(project, index) {
    const num    = String(index + 1).padStart(2, '0');
    const tags   = (project.tags || []).map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join('');
    const links  = this._buildLinks(project.links);

    return `
      <article class="project-card accent-${escapeHtml(project.accent || 'cyan')}">
        <div class="project-card-top">
          <span class="project-num">${num}</span>
          <div class="project-dot"></div>
        </div>
        <h3 class="project-title">${escapeHtml(project.title)}</h3>
        <p class="project-org">${escapeHtml(project.org)}</p>
        <p class="project-desc">${this._safeDesc(project.desc)}</p>
        <div class="project-tags">${tags}</div>
        ${links}
      </article>
    `;
  }

  _safeDesc(desc) {
    if (!desc) return '';
    return escapeHtml(desc).replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>');
  }

  _buildLinks(links) {
    if (!links) return '';
    const items = [];
    const github = sanitizeUrl(links.github);
    const demo   = sanitizeUrl(links.demo);
    if (github) items.push(`<a href="${github}" target="_blank" rel="noopener noreferrer" class="project-link">GitHub</a>`);
    if (demo)   items.push(`<a href="${demo}"   target="_blank" rel="noopener noreferrer" class="project-link">Demo</a>`);
    return items.length ? `<div class="project-links">${items.join('')}</div>` : '';
  }
}
