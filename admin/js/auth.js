const HASH_KEY   = 'admin_hash';
const PAT_KEY    = 'admin_pat';
const OWNER_KEY  = 'gh_owner';
const REPO_KEY   = 'gh_repo';
const BRANCH_KEY = 'gh_branch';

export class AdminAuth {
  static async hashPassword(password) {
    const encoded = new TextEncoder().encode(password);
    const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static isSetup() {
    return !!localStorage.getItem(HASH_KEY);
  }

  static async setupPassword(password) {
    const hash = await AdminAuth.hashPassword(password);
    localStorage.setItem(HASH_KEY, hash);
  }

  static async verify(password) {
    const stored = localStorage.getItem(HASH_KEY);
    if (!stored) return false;
    const hash = await AdminAuth.hashPassword(password);
    return hash === stored;
  }

  static savePAT(pat) {
    sessionStorage.setItem(PAT_KEY, pat);
  }

  static getPAT() {
    return sessionStorage.getItem(PAT_KEY) || '';
  }

  static logout() {
    sessionStorage.removeItem(PAT_KEY);
  }

  static isAuthenticated() {
    return !!sessionStorage.getItem(PAT_KEY);
  }

  static saveGitHubConfig(owner, repo, branch = 'main') {
    localStorage.setItem(OWNER_KEY,  owner);
    localStorage.setItem(REPO_KEY,   repo);
    localStorage.setItem(BRANCH_KEY, branch);
  }

  static getGitHubConfig() {
    return {
      owner:  localStorage.getItem(OWNER_KEY)  || '',
      repo:   localStorage.getItem(REPO_KEY)   || '',
      branch: localStorage.getItem(BRANCH_KEY) || 'main',
    };
  }
}
