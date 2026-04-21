import { escapeHtml } from '../../../shared/js/utils/sanitize.js';
import { showToast, showStatus } from '../admin-main.js';

export class ProfileEditor {
  constructor(container, ghApi) {
    this.container = container;
    this.ghApi = ghApi;
    this._sha   = null;
    this._data  = null;
    this._pendingImage = null; // { base64, ext }
  }

  async load() {
    this.container.innerHTML = '<p style="color:var(--color-text-muted);padding:1rem">불러오는 중...</p>';
    try {
      const { content, sha } = await this.ghApi.getFile('data/profile.json');
      this._data = content;
      this._sha  = sha;
      this._pendingImage = null;
      this._render();
    } catch (e) {
      this.container.innerHTML = `<p style="color:#ff4d4f;padding:1rem">${escapeHtml(e.message)}</p>`;
    }
  }

  _render() {
    const d = this._data;
    const currentImg = d.about?.image ? `../${d.about.image}` : '';

    this.container.innerHTML = `
      <div class="editor-form-panel">
        <div class="editor-form-panel-title">프로필 사진</div>
        <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:1rem">
          <div id="pf-img-preview" style="width:96px;height:96px;border-radius:50%;overflow:hidden;background:var(--color-bg-card);border:2px solid var(--color-border);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:2rem">
            ${currentImg
              ? `<img src="${escapeHtml(currentImg)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.textContent='👤'" />`
              : '👤'}
          </div>
          <div>
            <label class="btn btn-ghost" style="cursor:pointer;font-size:0.82rem;padding:0.4rem 0.9rem">
              📁 파일 선택
              <input type="file" id="pf-img-file" accept="image/*" style="display:none" />
            </label>
            <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:0.4rem">JPG, PNG, WebP — 최대 1MB 권장</p>
            <p id="pf-img-name" style="font-size:0.78rem;color:var(--color-primary);margin-top:0.2rem"></p>
          </div>
        </div>

        <div class="editor-form-panel-title" style="margin-top:0.5rem">기본 정보</div>
        <div class="form-group">
          <label class="form-label">이름 (한국어)</label>
          <input class="form-input" id="pf-name" value="${escapeHtml(d.name || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">이름 (영어)</label>
          <input class="form-input" id="pf-nameEn" value="${escapeHtml(d.nameEn || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">인사말 (Hero)</label>
          <input class="form-input" id="pf-greeting" value="${escapeHtml(d.greeting || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">직무 목록 (줄바꿈으로 구분)</label>
          <textarea class="form-textarea" id="pf-roles">${escapeHtml((d.roles || []).join('\n'))}</textarea>
        </div>

        <div class="editor-form-panel-title" style="margin-top:1.5rem">About 소개</div>
        <div class="form-group">
          <label class="form-label">소개 글</label>
          <textarea class="form-textarea" id="pf-desc" style="min-height:120px">${escapeHtml(d.about?.description || '')}</textarea>
        </div>

        <div class="editor-form-panel-title" style="margin-top:1.5rem">통계 카드</div>
        ${(d.stats || []).map((s, i) => `
          <div style="display:grid;grid-template-columns:60px 1fr 1fr;gap:0.5rem;margin-bottom:0.75rem">
            <input class="form-input" id="pf-stat-icon-${i}"  value="${escapeHtml(s.icon || '')}"  placeholder="아이콘" />
            <input class="form-input" id="pf-stat-label-${i}" value="${escapeHtml(s.label || '')}" placeholder="라벨" />
            <input class="form-input" id="pf-stat-value-${i}" value="${escapeHtml(s.value || '')}" placeholder="값" />
          </div>
        `).join('')}

        <div class="editor-form-panel-title" style="margin-top:1.5rem">연락처</div>
        <div class="form-group">
          <label class="form-label">이메일</label>
          <input class="form-input" id="pf-email" type="email" value="${escapeHtml(d.contact?.email || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">GitHub URL</label>
          <input class="form-input" id="pf-github" value="${escapeHtml(d.contact?.github || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">Blog URL</label>
          <input class="form-input" id="pf-blog" value="${escapeHtml(d.contact?.blog || '')}" />
        </div>

        <div class="form-actions">
          <div class="github-status" id="pf-status"></div>
          <button class="btn btn-primary" id="pf-save">저장 및 게시</button>
        </div>
      </div>
    `;

    document.getElementById('pf-img-file').addEventListener('change', e => this._onImageSelect(e));
    document.getElementById('pf-save').addEventListener('click', () => this._save());
  }

  _onImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('파일 크기가 5MB를 초과합니다.', 'error');
      e.target.value = '';
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result.split(',')[1];
      this._pendingImage = { base64, ext };

      document.getElementById('pf-img-preview').innerHTML =
        `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover" />`;
      document.getElementById('pf-img-name').textContent = `✓ ${file.name}`;
    };
    reader.readAsDataURL(file);
  }

  async _save() {
    showStatus('pf-status', 'saving', '저장 중...');
    try {
      if (this._pendingImage) {
        const imgPath = `assets/images/profile/avatar.${this._pendingImage.ext}`;
        const existingSha = await this.ghApi.getFileSha(imgPath);
        await this.ghApi.putRawFile(imgPath, this._pendingImage.base64, existingSha, 'admin: upload profile image');
        if (!this._data.about) this._data.about = {};
        this._data.about.image = imgPath;
        this._pendingImage = null;
      }

      const d = this._data;
      d.name     = document.getElementById('pf-name').value.trim();
      d.nameEn   = document.getElementById('pf-nameEn').value.trim();
      d.greeting = document.getElementById('pf-greeting').value.trim();
      d.roles    = document.getElementById('pf-roles').value.split('\n').map(r => r.trim()).filter(Boolean);
      if (!d.about) d.about = {};
      d.about.description = document.getElementById('pf-desc').value.trim();
      (d.stats || []).forEach((s, i) => {
        s.icon  = document.getElementById(`pf-stat-icon-${i}`)?.value.trim()  || s.icon;
        s.label = document.getElementById(`pf-stat-label-${i}`)?.value.trim() || s.label;
        s.value = document.getElementById(`pf-stat-value-${i}`)?.value.trim() || s.value;
      });
      if (!d.contact) d.contact = {};
      d.contact.email  = document.getElementById('pf-email').value.trim();
      d.contact.github = document.getElementById('pf-github').value.trim();
      d.contact.blog   = document.getElementById('pf-blog').value.trim();

      const res = await this.ghApi.putFile('data/profile.json', d, this._sha, 'admin: update profile.json');
      this._sha = res.content.sha;
      showStatus('pf-status', 'success', '저장 완료 ✓ (약 1분 후 반영)');
      showToast('프로필이 저장되었습니다.', 'success');
    } catch (e) {
      showStatus('pf-status', 'error', e.message);
      showToast(e.message, 'error');
    }
  }
}
