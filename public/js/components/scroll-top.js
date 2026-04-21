export class ScrollTopButton {
  constructor(buttonId) {
    this.btn = document.getElementById(buttonId);
  }

  init() {
    if (!this.btn) return;

    const toggle = () => {
      this.btn.classList.toggle('visible', window.scrollY > 300);
    };

    window.addEventListener('scroll', toggle, { passive: true });
    toggle();

    this.btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
