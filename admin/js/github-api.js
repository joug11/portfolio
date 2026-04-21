const BASE = 'https://api.github.com';

export class GitHubApiService {
  constructor(owner, repo, branch, pat) {
    this.owner  = owner;
    this.repo   = repo;
    this.branch = branch || 'main';
    this.pat    = pat;
  }

  _headers() {
    return {
      Authorization: `Bearer ${this.pat}`,
      Accept:        'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async getFile(path) {
    const url = `${BASE}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;
    const res = await fetch(url, { headers: this._headers() });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`GitHub API 오류 [${res.status}]: ${err.message || path}`);
    }

    const json    = await res.json();
    const content = JSON.parse(decodeURIComponent(escape(atob(json.content.replace(/\n/g, '')))));
    return { content, sha: json.sha };
  }

  async getFileSha(path) {
    const url = `${BASE}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`;
    const res = await fetch(url, { headers: this._headers() });
    if (!res.ok) return null;
    const json = await res.json();
    return json.sha || null;
  }

  async putRawFile(path, base64Content, sha, message) {
    const url  = `${BASE}/repos/${this.owner}/${this.repo}/contents/${path}`;
    const body = { message, content: base64Content, branch: this.branch };
    if (sha) body.sha = sha;
    const res = await fetch(url, {
      method:  'PUT',
      headers: this._headers(),
      body:    JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`이미지 업로드 실패 [${res.status}]: ${err.message || '알 수 없는 오류'}`);
    }
    return res.json();
  }

  async putFile(path, data, sha, message) {
    const url     = `${BASE}/repos/${this.owner}/${this.repo}/contents/${path}`;
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    const res = await fetch(url, {
      method:  'PUT',
      headers: this._headers(),
      body:    JSON.stringify({ message, content: encoded, sha, branch: this.branch }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 409) throw new Error('SHA 충돌: 다른 탭에서 먼저 저장했습니다. 새로고침 후 재시도해 주세요.');
      throw new Error(`저장 실패 [${res.status}]: ${err.message || '알 수 없는 오류'}`);
    }

    return res.json();
  }
}
