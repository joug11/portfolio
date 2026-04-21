import { AdminAuth }          from './auth.js';
import { GitHubApiService }   from './github-api.js';
import { AdminRouter }        from './admin-router.js';
import { ProfileEditor }      from './editors/profile-editor.js';
import { ProjectsEditor }     from './editors/projects-editor.js';
import { SkillsEditor }       from './editors/skills-editor.js';
import { ExperienceEditor }   from './editors/experience-editor.js';

let _toastTimer = null;

export function showToast(message, type = '') {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className   = `toast ${type}`;
  clearTimeout(_toastTimer);
  requestAnimationFrame(() => toast.classList.add('show'));
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

export function showStatus(id, type, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className   = `github-status ${type}`;
  el.textContent = message;
}

function createGhApi() {
  const { owner, repo, branch } = AdminAuth.getGitHubConfig();
  const pat = AdminAuth.getPAT();
  return new GitHubApiService(owner, repo, branch, pat);
}

function renderSettingsPanel(container) {
  const cfg = AdminAuth.getGitHubConfig();
  container.innerHTML = `
    <div class="editor-form-panel">
      <div class="editor-form-panel-title">GitHub 저장소 설정</div>
      <div class="form-group">
        <label class="form-label">GitHub 사용자명 (owner)</label>
        <input class="form-input" id="cfg-owner" value="${cfg.owner}" placeholder="예: joug11" />
      </div>
      <div class="form-group">
        <label class="form-label">저장소 이름 (repo)</label>
        <input class="form-input" id="cfg-repo" value="${cfg.repo}" placeholder="예: portfolio" />
      </div>
      <div class="form-group">
        <label class="form-label">브랜치</label>
        <input class="form-input" id="cfg-branch" value="${cfg.branch}" placeholder="main" />
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" id="cfg-save">저장</button>
      </div>
    </div>

    <div class="editor-form-panel" style="margin-top:1.5rem">
      <div class="editor-form-panel-title">비밀번호 변경</div>
      <div class="form-group">
        <label class="form-label">새 비밀번호</label>
        <input class="form-input" id="cfg-pw" type="password" placeholder="새 비밀번호 입력" />
      </div>
      <div class="form-group">
        <label class="form-label">확인</label>
        <input class="form-input" id="cfg-pw2" type="password" placeholder="비밀번호 재입력" />
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" id="cfg-pw-save">비밀번호 변경</button>
      </div>
    </div>
  `;

  document.getElementById('cfg-save').addEventListener('click', () => {
    const owner  = document.getElementById('cfg-owner').value.trim();
    const repo   = document.getElementById('cfg-repo').value.trim();
    const branch = document.getElementById('cfg-branch').value.trim() || 'main';
    AdminAuth.saveGitHubConfig(owner, repo, branch);
    showToast('설정이 저장되었습니다.', 'success');
  });

  document.getElementById('cfg-pw-save').addEventListener('click', async () => {
    const pw  = document.getElementById('cfg-pw').value;
    const pw2 = document.getElementById('cfg-pw2').value;
    if (!pw) return showToast('비밀번호를 입력해주세요.', 'error');
    if (pw !== pw2) return showToast('비밀번호가 일치하지 않습니다.', 'error');
    await AdminAuth.setupPassword(pw);
    showToast('비밀번호가 변경되었습니다.', 'success');
  });
}

function initDashboard() {
  const content = document.getElementById('adminContent');
  const ghApi   = createGhApi();

  const editors = {
    '#/profile':    new ProfileEditor(content, ghApi),
    '#/projects':   new ProjectsEditor(content, ghApi),
    '#/skills':     new SkillsEditor(content, ghApi),
    '#/experience': new ExperienceEditor(content, ghApi),
  };

  const router = new AdminRouter({
    '#/profile':    () => editors['#/profile'].load(),
    '#/projects':   () => editors['#/projects'].load(),
    '#/skills':     () => editors['#/skills'].load(),
    '#/experience': () => editors['#/experience'].load(),
    '#/settings':   () => renderSettingsPanel(content),
  });

  router.init();

  document.getElementById('adminLogout').addEventListener('click', () => {
    AdminAuth.logout();
    location.reload();
  });
}

async function handleLogin() {
  const pw  = document.getElementById('loginPw').value;
  const pat = document.getElementById('loginPat').value.trim();
  const err = document.getElementById('loginError');

  if (!pat) { err.textContent = 'GitHub PAT를 입력해주세요.'; return; }
  if (!await AdminAuth.verify(pw)) { err.textContent = '비밀번호가 올바르지 않습니다.'; return; }

  AdminAuth.savePAT(pat);
  location.reload();
}

async function handleSetup() {
  const pw  = document.getElementById('setupPw').value;
  const pw2 = document.getElementById('setupPw2').value;
  const err = document.getElementById('setupError');

  if (!pw)       { err.textContent = '비밀번호를 입력해주세요.'; return; }
  if (pw !== pw2) { err.textContent = '비밀번호가 일치하지 않습니다.'; return; }

  await AdminAuth.setupPassword(pw);
  document.getElementById('setupView').classList.add('hidden');
  document.getElementById('loginView').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  if (AdminAuth.isAuthenticated()) {
    document.getElementById('loginWrap').classList.add('hidden');
    document.getElementById('dashboardWrap').classList.remove('hidden');
    initDashboard();
    return;
  }

  if (!AdminAuth.isSetup()) {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('setupView').classList.remove('hidden');
  }

  document.getElementById('setupBtn')?.addEventListener('click', handleSetup);
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('loginPat')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
});
