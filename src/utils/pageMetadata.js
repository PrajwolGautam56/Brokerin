export function setPageMetadata({ title, description, image, path = window.location.pathname, noindex = false }) {
  document.title = title;
  const meta = (key, content, property = false) => {
    const attr = property ? 'property' : 'name';
    let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attr, key); document.head.appendChild(tag); }
    tag.content = content;
  };
  meta('description', description);
  meta('robots', noindex ? 'noindex,nofollow' : 'index,follow');
  meta('og:title', title, true); meta('og:description', description, true);
  meta('og:url', `https://www.brokerin.in${path}`, true);
  meta('og:image', image || 'https://www.brokerin.in/images/logo.png', true);
  meta('og:type', 'website', true);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = `https://www.brokerin.in${path}`;
}
