import { escapeHtml } from '../../../shared/js/utils/sanitize.js';
import { showToast, showStatus } from '../admin-main.js';

const ACCENTS = ['cyan', 'green', 'purple', 'orange', 'blue', 'pink', 'yellow', 'teal'];

export class ProjectsEditor {
  constructor(container, ghApi) {
    this.container = container;
    this.ghApi     = ghApi;
    this._sha      = null;
    this._data     = [];
    this._bound    = false;
  }

  async load() {
    this.container.innerHTML = '<p style="color:var(--color-text-muted);padding:1rem">불러오는 중...</p>';
    try {
      const { content, sha } = await this.ghApi.getFile('data/projects.json');
      this._data = content;
      this._sha  = sha;
      this._render();
      if (!this._bound) {
        this._bound = true;
        this._bindEvents();
      }
    } catch (e) {
      this.container.innerHTML = `<p style="color:#ff4d4f;padding:1rem">${escapeHtml(e.message)}</p>`;
    }
  }

  _bindEvents() {
    this.container.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id     = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === 'add-proj') this._openForm(null);
      if (action === 'edit')     this._openForm(id);
      if (action === 'toggle')   this._toggle(id);
      if (action === 'delete')   this._delete(id);
      if (action === 'up')       this._move(id, -1);
      if (action === 'down')     this._move(id, 1);
    });
  }

  _render() {
    const sorted = [...this._data].sort((a, b) => a.order - b.order);
    const listHtml = sorted.map(p => `
      <div class="item-row" data-id="${p.id}">
        <span class="item-row-drag">☰</span>
        <span class="item-row-title">${escapeHtml(p.title)}</span>
        <span class="item-row-org">${escapeHtml(p.org)}</span>
        <span class="visibility-badge ${p.visible ? 'visible' : 'hidden'}">${p.visible ? '공개' : '숨김'}</span>
        <div class="item-row-actions">
          <button class="icon-btn" data-action="up"     data-id="${p.id}" title="위로">▲</button>
          <button class="icon-btn" data-action="down"   data-id="${p.id}" title="아래로">▼</button>
          <button class="icon-btn" data-action="edit"   data-id="${p.id}" title="수정">✏️</button>
          <button class="icon-btn" data-action="toggle" data-id="${p.id}" title="공개/숨김">👁</button>
          <button class="icon-btn danger" data-action="delete" data-id="${p.id}" title="삭제">🗑</button>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="editor-header">
        <span class="editor-title">프로젝트 목록 (${this._data.length}개)</span>
        <button class="btn btn-primary" data-action="add-proj">+ 새 프로젝트</button>
      </div>
      <div class="item-list">${listHtml}</div>
      <div id="proj-form-wrap"></div>
      <div style="text-align:right;margin-top:1rem">
        <div class="github-status" id="proj-status" style="display:inline-flex"></div>
      </div>
    `;
  }

  _openForm(id) {
    const project = id ? this._data.find(p => p.id === id) : null;
    const isNew   = !project;
    const p       = project || { id: Date.now(), title: '', org: '', desc: '', tags: [], accent: 'cyan', image: '', links: { github: null, demo: null }, order: this._data.length + 1, visible: true };

    const accentSwatches = ACCENTS.map(a => `
      <span class="accent-swatch ${p.accent === a ? 'selected' : ''}"
            style="background:var(--accent-${a})"
            data-accent="${a}" title="${a}"></span>
    `).join('');

    document.getElementById('proj-form-wrap').innerHTML = `
      <div class="editor-form-panel" style="margin-top:1rem">
        <div class="editor-form-panel-title">${isNew ? '새 프로젝트 추가' : '프로젝트 수정'}</div>
        <div class="form-group">
          <label class="form-label">제목</label>
          <input class="form-input" id="pj-title" value="${escapeHtml(p.title)}" />
        </div>
        <div class="form-group">
          <label class="form-label">기관/회사</label>
          <input class="form-input" id="pj-org" value="${escapeHtml(p.org)}" />
        </div>
        <div class="form-group">
          <label class="form-label">설명</label>
          <textarea class="form-textarea" id="pj-desc">${escapeHtml(p.desc)}</textarea>
          <span class="form-hint">&lt;strong&gt;텍스트&lt;/strong&gt; 태그로 강조 표시 가능</span>
        </div>
        <div class="form-group">
          <label class="form-label">태그 (쉼표로 구분)</label>
          <input class="form-input" id="pj-tags" value="${escapeHtml((p.tags || []).join(', '))}" />
        </div>
        <div class="form-group">
          <label class="form-label">액센트 색상</label>
          <div class="accent-picker" id="pj-accent-picker">${accentSwatches}</div>
          <input type="hidden" id="pj-accent" value="${escapeHtml(p.accent)}" />
        </div>
        <div class="form-group">
          <label class="form-label">GitHub 링크</label>
          <input class="form-input" id="pj-github" value="${escapeHtml(p.links?.github || '')}" placeholder="https://github.com/..." />
        </div>
        <div class="form-group">
          <label class="form-label">Demo 링크</label>
          <input class="form-input" id="pj-demo" value="${escapeHtml(p.links?.demo || '')}" placeholder="https://..." />
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="pj-cancel">취소</button>
          <button class="btn btn-primary" id="pj-save">저장 및 게시</button>
        </div>
      </div>
    `;

    document.getElementById('pj-accent-picker').addEventListener('click', e => {
      const swatch = e.target.closest('.accent-swatch');
      if (!swatch) return;
      document.querySelectorAll('.accent-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      document.getElementById('pj-accent').value = swatch.dataset.accent;
    });

    document.getElementById('pj-cancel').addEventListener('click', () => {
      document.getElementById('proj-form-wrap').innerHTML = '';
    });

    document.getElementById('pj-save').addEventListener('click', () => this._saveProject(p, isNew));
  }

  async _saveProject(p, isNew) {
    p.title  = document.getElementById('pj-title').value.trim();
    p.org    = document.getElementById('pj-org').value.trim();
    p.desc   = document.getElementById('pj-desc').value.trim();
    p.tags   = document.getElementById('pj-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    p.accent = document.getElementById('pj-accent').value;
    p.links  = {
      github: document.getElementById('pj-github').value.trim() || null,
      demo:   document.getElementById('pj-demo').value.trim()   || null,
    };

    if (isNew) this._data.push(p);
    else {
      const idx = this._data.findIndex(x => x.id === p.id);
      if (idx >= 0) this._data[idx] = p;
    }

    await this._publish('admin: update projects.json');
  }

  async _toggle(id) {
    const p = this._data.find(x => x.id === id);
    if (p) p.visible = !p.visible;
    await this._publish('admin: toggle project visibility');
  }

  async _delete(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this._data = this._data.filter(x => x.id !== id);
    await this._publish('admin: delete project');
  }

  async _move(id, dir) {
    const sorted = [...this._data].sort((a, b) => a.order - b.order);
    const idx    = sorted.findIndex(x => x.id === id);
    const swap   = sorted[idx + dir];
    if (!swap) return;
    const tmp = sorted[idx].order;
    sorted[idx].order = swap.order;
    swap.order = tmp;
    await this._publish('admin: reorder projects');
  }

  async _publish(message) {
    showStatus('proj-status', 'saving', '저장 중...');
    try {
      const res = await this.ghApi.putFile('data/projects.json', this._data, this._sha, message);
      this._sha = res.content.sha;
      showStatus('proj-status', 'success', '저장 완료 ✓');
      showToast('저장되었습니다.', 'success');
      this._render();
    } catch (e) {
      showStatus('proj-status', 'error', e.message);
      showToast(e.message, 'error');
    }
  }
}
