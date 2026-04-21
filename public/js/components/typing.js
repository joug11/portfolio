export class TypingAnimation {
  constructor(elementId, texts) {
    this.el    = document.getElementById(elementId);
    this.texts = texts || [];
    this._tIdx = 0;
    this._cIdx = 0;
    this._isDeleting = false;
    this._timer = null;
  }

  start(delayMs = 0) {
    if (!this.el || !this.texts.length) return;
    this._timer = setTimeout(() => this._type(), delayMs);
  }

  stop() {
    clearTimeout(this._timer);
  }

  _type() {
    const current = this.texts[this._tIdx];

    if (!this._isDeleting) {
      this.el.textContent = current.slice(0, this._cIdx + 1);
      this._cIdx++;
      if (this._cIdx === current.length) {
        this._isDeleting = true;
        this._timer = setTimeout(() => this._type(), 1800);
        return;
      }
      this._timer = setTimeout(() => this._type(), 85);
    } else {
      this.el.textContent = current.slice(0, this._cIdx - 1);
      this._cIdx--;
      if (this._cIdx === 0) {
        this._isDeleting = false;
        this._tIdx = (this._tIdx + 1) % this.texts.length;
        this._timer = setTimeout(() => this._type(), 400);
        return;
      }
      this._timer = setTimeout(() => this._type(), 45);
    }
  }
}
