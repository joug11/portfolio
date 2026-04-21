import { escapeHtml, sanitizeUrl } from '../../../shared/js/utils/sanitize.js';

export class ProfileRenderer {
  constructor(dataLoader) {
    this.loader = dataLoader;
  }

  renderHero(profile) {
    const greeting = document.getElementById('heroGreeting');
    const name     = document.getElementById('heroName');
    const desc     = document.getElementById('heroDesc');
    const ghBtn    = document.getElementById('heroGithubBtn');

    if (greeting) greeting.textContent = profile.greeting || '';
    if (name)     name.textContent     = profile.name || '';
    if (desc)     desc.textContent     = profile.about?.description?.split('\n')[0] || '';
    if (ghBtn && profile.contact?.github) {
      ghBtn.href = sanitizeUrl(profile.contact.github);
    }
  }

  renderAbout(profile) {
    const descEl   = document.getElementById('aboutDescription');
    const cardsEl  = document.getElementById('aboutCards');
    const circleEl = document.getElementById('profileCircle');

    if (circleEl && profile.about?.image) {
      circleEl.innerHTML = `<img src="${escapeHtml(profile.about.image)}" alt="프로필 사진" style="width:100%;height:100%;object-fit:cover" />`;
    }

    if (descEl && profile.about?.description) {
      descEl.textContent = profile.about.description;
    }

    if (cardsEl && Array.isArray(profile.stats)) {
      cardsEl.innerHTML = profile.stats.map(stat => `
        <div class="about-card">
          <span class="about-card-icon">${escapeHtml(stat.icon)}</span>
          <div>
            <strong>${escapeHtml(stat.label)}</strong>
            <span class="about-card-num">${escapeHtml(stat.value)}</span>
          </div>
        </div>
      `).join('');
    }
  }

  renderContact(profile) {
    const cardsEl = document.getElementById('contactCards');
    if (!cardsEl || !profile.contact) return;

    const { email, github, blog } = profile.contact;
    const items = [];

    if (email) {
      items.push(`
        <a href="mailto:${escapeHtml(email)}" class="contact-card">
          <span class="contact-icon">📧</span>
          <div>
            <strong>Email</strong>
            <span>${escapeHtml(email)}</span>
          </div>
        </a>
      `);
    }

    if (github) {
      const url = sanitizeUrl(github);
      items.push(`
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="contact-card">
          <span class="contact-icon">🐙</span>
          <div>
            <strong>GitHub</strong>
            <span>${escapeHtml(github.replace('https://', ''))}</span>
          </div>
        </a>
      `);
    }

    if (blog) {
      const url = sanitizeUrl(blog);
      items.push(`
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="contact-card">
          <span class="contact-icon">📝</span>
          <div>
            <strong>Blog</strong>
            <span>${escapeHtml(blog.replace('https://', ''))}</span>
          </div>
        </a>
      `);
    }

    cardsEl.innerHTML = items.join('');

    const ctaBtn = document.getElementById('contactCtaBtn');
    if (ctaBtn && email) {
      ctaBtn.href = `mailto:${escapeHtml(email)}`;
    }
  }
}
