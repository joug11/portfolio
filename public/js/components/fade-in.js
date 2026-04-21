export class FadeInObserver {
  constructor(selector) {
    this.selector = selector;
  }

  observe() {
    const elements = document.querySelectorAll(this.selector);
    if (!elements.length) return;

    document.querySelectorAll('.section').forEach(section => {
      section.querySelectorAll(this.selector).forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.12}s`;
      });
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }

  observeNew(root) {
    const elements = root.querySelectorAll(this.selector);
    elements.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }
}
