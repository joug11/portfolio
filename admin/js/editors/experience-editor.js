import { escapeHtml } from '../../../shared/js/utils/sanitize.js';
import { showToast, showStatus } from '../admin-main.js';

export class ExperienceEditor {
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
      const { content, sha } = await this.ghApi.getFile('data/experience.json');
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
      const action = btn.dataset.action;
      if (action === 'exp-toggle')  this._toggle(Number(btn.dataset.id));
      if (action === 'exp-delete')  this._delete(Number(btn.dataset.id));
      if (action === 'exp-edit')    this._openPeriodForm(Number(btn.dataset.id));
      if (action === 'item-add')    this._addItem(Number(btn.dataset.expId));
      if (action === 'item-delete') this._deleteItem(Number(btn.dataset.expId), Number(btn.dataset.itemId));
      if (action === 'add-period')  this._openPeriodForm(null);
    });
  }

  _render() {
    const sorted = [...this._data].sort((a, b) => a.order - b.order);

    const periodsHtml = sorted.map(exp => `
      <div class="editor-form-panel" style="margin-bottom:1rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
          <div>
            <strong style="color:var(--color-primary)">${escapeHtml(exp.period)}</strong>
            <span class="visibility-badge ${exp.visible ? 'visible' : 'hidden'}" style="margin-left:0.5rem">${exp.visible ? '공개' : '숨김'}</span>
          </div>
          <div style="display:flex;gap:0.4rem">
            <button class="icon-btn" data-action="exp-toggle" data-id="${exp.id}">👁</button>
            <button class="icon-btn" data-action="exp-edit"   data-id="${exp.id}">✏️</button>
            <button class="icon-btn danger" data-action="exp-delete" data-id="${exp.id}">🗑</button>
          </div>
        </div>
        <ul style="padding-left:1rem">
          ${(exp.items || []).map(item => `
            <li style="font-size:0.85rem;color:var(--color-text-muted);margin-bottom:0.3rem;display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
              <span>${escapeHtml(item.text)}${item.sub ? `<br><small style="color:rgba(138,155,189,0.7)">${escapeHtml(item.sub)}</small>` : ''}</span>
              <button class="icon-btn danger" style="flex-shrink:0" data-action="item-delete" data-exp-id="${exp.id}" data-item-id="${item.id}">×</button>
            </li>
          `).join('')}
        </ul>
        <button class="btn btn-ghost" style="margin-top:0.75rem;font-size:0.78rem;padding:0.3rem 0.75rem" data-action="item-add" data-exp-id="${exp.id}">+ 항목 추가</button>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="editor-header">
        <span class="editor-title">경력 기간 (${this._data.length}개)</span>
        <button class="btn btn-primary" data-action="add-period">+ 기간 추가</button>
      </div>
      ${periodsHtml}
      <div id="exp-form-wrap"></div>
      <div style="text-align:right;margin-top:0.5rem">
        <div class="github-status" id="exp-status" style="display:inline-flex"></div>
      </div>
    `;
  }

  _openPeriodForm(id) {
    const exp   = id ? this._data.find(e => e.id === id) : null;
    const isNew = !exp;
    document.getElementById('exp-form-wrap').innerHTML = `
      <div class="editor-form-panel" style="margin-top:1rem">
        <div class="editor-form-panel-title">${isNew ? '기간 추가' : '기간 수정'}</div>
        <div class="form-group">
          <label class="form-label">기간 표시 텍스트</label>
          <input class="form-input" id="ep-period" value="${escapeHtml(exp?.period || '')}" placeholder="예: 2026 ~ 현재" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
          <div class="form-group">
            <label class="form-label">시작 (YYYY-MM)</label>
            <input class="form-input" id="ep-start" value="${escapeHtml(exp?.startDate || '')}" placeholder="2026-01" />
          </div>
          <div class="form-group">
            <label class="form-label">종료 (비워두면 현재)</label>
            <input class="form-input" id="ep-end" value="${escapeHtml(exp?.endDate || '')}" placeholder="2026-12" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="ep-cancel">취소</button>
          <button class="btn btn-primary" id="ep-save">저장</button>
        </div>
      </div>
    `;
    document.getElementById('ep-cancel').addEventListener('click', () => {
      document.getElementById('exp-form-wrap').innerHTML = '';
    });
    document.getElementById('ep-save').addEventListener('click', async () => {
      const period    = document.getElementById('ep-period').value.trim();
      const startDate = document.getElementById('ep-start').value.trim();
      const endDate   = document.getElementById('ep-end').value.trim() || null;
      if (!period) return;
      if (isNew) {
        this._data.push({ id: Date.now(), period, startDate, endDate, order: this._data.length + 1, visible: true, items: [] });
      } else {
        const e = this._data.find(e => e.id === id);
        if (e) { e.period = period; e.startDate = startDate; e.endDate = endDate; }
      }
      await this._publish('admin: update experience period');
    });
  }

  _addItem(expId) {
    const text = prompt('항목 텍스트:');
    if (!text?.trim()) return;
    const sub = prompt('보조 설명 (선택사항, 없으면 취소):') || null;
    const exp = this._data.find(e => e.id === expId);
    if (exp) {
      const maxId = Math.max(0, ...(exp.items || []).map(i => i.id));
      exp.items = exp.items || [];
      exp.items.push({ id: maxId + 1, text: text.trim(), sub: sub?.trim() || null });
      this._publish('admin: add experience item');
    }
  }

  _deleteItem(expId, itemId) {
    const exp = this._data.find(e => e.id === expId);
    if (exp) {
      exp.items = (exp.items || []).filter(i => i.id !== itemId);
      this._publish('admin: delete experience item');
    }
  }

  _toggle(id) {
    const exp = this._data.find(e => e.id === id);
    if (exp) { exp.visible = !exp.visible; this._publish('admin: toggle experience period'); }
  }

  _delete(id) {
    if (!confirm('이 기간을 삭제하시겠습니까?')) return;
    this._data = this._data.filter(e => e.id !== id);
    this._publish('admin: delete experience period');
  }

  async _publish(message) {
    showStatus('exp-status', 'saving', '저장 중...');
    try {
      const res = await this.ghApi.putFile('data/experience.json', this._data, this._sha, message);
      this._sha = res.content.sha;
      showStatus('exp-status', 'success', '저장 완료 ✓');
      showToast('저장되었습니다.', 'success');
      this._render();
    } catch (e) {
      showStatus('exp-status', 'error', e.message);
      showToast(e.message, 'error');
    }
  }
}
