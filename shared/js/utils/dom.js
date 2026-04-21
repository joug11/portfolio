export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function setTextContent(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

export function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}
