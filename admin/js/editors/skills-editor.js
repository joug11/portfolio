import { escapeHtml } from '../../../shared/js/utils/sanitize.js';
import { showToast, showStatus } from '../admin-main.js';

export class SkillsEditor {
  constructor(container, ghApi) {
    this.container = container;
    this.ghApi     = ghApi;
    this._sha      = null;
    this._data     = [];
    this._editCatId = null;
  }

  async load() {
    this.container.innerHTML = '<p style="color:var(--color-text-muted);padding:1rem">불러오는 중...</p>';
    try {
      const { content, sha } = await this.ghApi.getFile('data/skills.json');
      this._data = content;
      this._sha  = sha;
      this._render();
    } catch (e) {
      this.container.innerHTML = `<p style="color:#ff4d4f;padding:1rem">${escapeHtml(e.message)}</p>`;
    }
  }

  _render() {
    const sorted = [...this._data].sort((a, b) => a.order - b.order);
    const categoriesHtml = sorted.map(cat => `
      <div class="editor-form-panel" style="margin-bottom:1rem" data-cat-id="${cat.id}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
          <div>
            <strong style="font-size:0.9rem">${escapeHtml(cat.label)}</strong>
            <span style="font-size:0.75rem;color:var(--color-text-muted);margin-left:0.5rem">${escapeHtml(cat.category)}</span>
            <span class="visibility-badge ${cat.visible ? 'visible' : 'hidden'}" style="margin-left:0.5rem">${cat.visible ? '공개' : '숨김'}</span>
          </div>
          <div style="display:flex;gap:0.4rem">
            <button class="icon-btn" data-action="cat-toggle" data-id="${cat.id}">👁</button>
            <button class="icon-btn" data-action="cat-edit"   data-id="${cat.id}">✏️</button>
            <button class="icon-btn danger" data-action="cat-delete" data-id="${cat.id}">🗑</button>
          </div>
        </div>
        <div class="skills-tags" style="display:flex;flex-wrap:wrap;gap:0.4rem">
          ${(cat.items || []).map(item => `
            <span style="display:inline-flex;align-items:center;gap:0.3rem;background:rgba(0,212,255,0.08);border:1px solid var(--color-border);border-radius:100px;padding:0.25rem 0.7rem;font-size:0.8rem">
              ${escapeHtml(item.name)}
              <button class="tag-chip-remove" data-action="item-delete" data-cat-id="${cat.id}" data-item-id="${item.id}">×</button>
            </span>
          `).join('')}
          <button class="icon-btn" data-action="item-add" data-cat-id="${cat.id}" style="border-radius:100px;padding:0 0.6rem;font-size:0.75rem;width:auto">+ 추가</button>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="editor-header">
        <span class="editor-title">스킬 카테고리 (${this._data.length}개)</span>
        <button class="btn btn-primary" id="sk-add-cat">+ 카테고리 추가</button>
      </div>
      ${categoriesHtml}
      <div id="sk-form-wrap"></div>
      <div style="text-align:right;margin-top:0.5rem">
        <div class="github-status" id="sk-status" style="display:inline-flex"></div>
      </div>
    `;

    this.container.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'cat-toggle') this._toggleCat(Number(btn.dataset.id));
      if (action === 'cat-delete') this._deleteCat(Number(btn.dataset.id));
      if (action === 'cat-edit')   this._editCat(Number(btn.dataset.id));
      if (action === 'item-add')   this._addItem(Number(btn.dataset.catId));
      if (action === 'item-delete') this._deleteItem(Number(btn.dataset.catId), Number(btn.dataset.itemId));
    });

    document.getElementById('sk-add-cat').addEventListener('click', () => this._editCat(null));
  }

  _editCat(id) {
    const cat = id ? this._data.find(c => c.id === id) : null;
    const isNew = !cat;
    document.getElementById('sk-form-wrap').innerHTML = `
      <div class="editor-form-panel" style="margin-top:1rem">
        <div class="editor-form-panel-title">${isNew ? '카테고리 추가' : '카테고리 수정'}</div>
        <div class="form-group">
          <label class="form-label">카테고리 키 (영문, 소문자)</label>
          <input class="form-input" id="sk-cat-key" value="${escapeHtml(cat?.category || '')}" placeholder="예: backend" />
        </div>
        <div class="form-group">
          <label class="form-label">표시 이름</label>
          <input class="form-input" id="sk-cat-label" value="${escapeHtml(cat?.label || '')}" placeholder="예: Backend" />
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="sk-cat-cancel">취소</button>
          <button class="btn btn-primary" id="sk-cat-save">저장</button>
        </div>
      </div>
    `;
    document.getElementById('sk-cat-cancel').addEventListener('click', () => {
      document.getElementById('sk-form-wrap').innerHTML = '';
    });
    document.getElementById('sk-cat-save').addEventListener('click', async () => {
      const key   = document.getElementById('sk-cat-key').value.trim();
      const label = document.getElementById('sk-cat-label').value.trim();
      if (!key || !label) return;
      if (isNew) {
        this._data.push({ id: Date.now(), category: key, label, order: this._data.length + 1, visible: true, items: [] });
      } else {
        const c = this._data.find(c => c.id === id);
        if (c) { c.category = key; c.label = label; }
      }
      await this._publish('admin: update skills categories');
    });
  }

  _addItem(catId) {
    const name = prompt('스킬 이름을 입력하세요:');
    if (!name?.trim()) return;
    const cat = this._data.find(c => c.id === catId);
    if (cat) {
      const maxId = Math.max(0, ...(cat.items || []).map(i => i.id));
      cat.items = cat.items || [];
      cat.items.push({ id: maxId + 1, name: name.trim(), level: 3 });
      this._publish('admin: add skill item');
    }
  }

  _deleteItem(catId, itemId) {
    const cat = this._data.find(c => c.id === catId);
    if (cat) {
      cat.items = (cat.items || []).filter(i => i.id !== itemId);
      this._publish('admin: delete skill item');
    }
  }

  _toggleCat(id) {
    const cat = this._data.find(c => c.id === id);
    if (cat) { cat.visible = !cat.visible; this._publish('admin: toggle skill category'); }
  }

  _deleteCat(id) {
    if (!confirm('카테고리를 삭제하시겠습니까?')) return;
    this._data = this._data.filter(c => c.id !== id);
    this._publish('admin: delete skill category');
  }

  async _publish(message) {
    showStatus('sk-status', 'saving', '저장 중...');
    try {
      const res = await this.ghApi.putFile('data/skills.json', this._data, this._sha, message);
      this._sha = res.content.sha;
      showStatus('sk-status', 'success', '저장 완료 ✓');
      showToast('저장되었습니다.', 'success');
      this._render();
    } catch (e) {
      showStatus('sk-status', 'error', e.message);
      showToast(e.message, 'error');
    }
  }
}
