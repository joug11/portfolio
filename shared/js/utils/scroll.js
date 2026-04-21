export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function getScrollY() {
  return window.scrollY || window.pageYOffset;
}

export function onScroll(handler, options = { passive: true }) {
  window.addEventListener('scroll', handler, options);
  return () => window.removeEventListener('scroll', handler);
}
