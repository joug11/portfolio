export class DataLoader {
  constructor() {
    this._cache = new Map();
  }

  async load(path) {
    if (this._cache.has(path)) {
      return this._cache.get(path);
    }
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._cache.set(path, data);
      return data;
    } catch (err) {
      console.warn(`DataLoader: 로드 실패 - ${path}`, err);
      return [];
    }
  }

  async loadAll(paths) {
    return Promise.all(paths.map(p => this.load(p)));
  }

  clearCache() {
    this._cache.clear();
  }
}
