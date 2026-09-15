/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Amazon Kindle "Your Company Bookshelf" landing site — site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html.
 *
 * Non-authorable site chrome removed:
 *   - Skip-links / assistant nav: <nav id="shortcut-menu"> (line 19), <a id="nav-top"> (line 17),
 *     <a id="skippedLink"> (line 2362)
 *   - Global masthead nav: <header id="navbar-main"> (line 116; wraps nested
 *     header._Ym9va_linkColumnHeader_tH6A_ flyout headers, lines 1523-1692)
 *   - Global footer: <div id="navFooter"> (line 3062)
 *   - Trailing scraper/runtime probe artifacts appended after content:
 *     #be, #a-popover-root, #amzn-nv-flyout-healthy-choice, #nav-rufus-disc-txt,
 *     #a-truncate-cut, #sp-cc-wrapper, #sp-cc, #pldn-deep-link, #add-to-cart-btn,
 *     #amzn-nav-app-banner-container, and probe divs .mo-wp / .a-image-container /
 *     .amzn-box-inner / .js-order-card / .sparkle-container (lines 3540-3561)
 *   - Non-authorable stylesheet <link> tags embedded inside the authorable slots
 *     (lines 2377-2801), plus <script>/<noscript>/<style>
 *
 * NOTE: id="header" at line 2808 is AUTHORABLE content (the FAQ section's
 * "Frequently Asked Questions" heading wrapper) — never target it by id.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Global masthead / skip-link / assistant nav chrome (verified in cleaned.html).
    WebImporter.DOMUtils.remove(element, [
      '#shortcut-menu',
      '#navbar-main',
      '#nav-top',
      '#skippedLink',
    ]);

    // Global footer (verified in cleaned.html).
    WebImporter.DOMUtils.remove(element, ['#navFooter']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Trailing non-authorable probe/runtime artifacts appended after page content.
    WebImporter.DOMUtils.remove(element, [
      '#be',
      '#a-popover-root',
      '#amzn-nv-flyout-healthy-choice',
      '#nav-rufus-disc-txt',
      '#a-truncate-cut',
      '#sp-cc-wrapper',
      '#sp-cc',
      '#pldn-deep-link',
      '#add-to-cart-btn',
      '#amzn-nav-app-banner-container',
      '.mo-wp',
      '.a-image-container',
      '.amzn-box-inner',
      '.js-order-card',
      '.sparkle-container',
    ]);

    // Non-authorable embedded resources / scripts.
    WebImporter.DOMUtils.remove(element, ['link', 'script', 'noscript', 'style']);

    // Tracking pixels and global nav sprite images that leak into the top of the
    // hero cell (1x1 uedata beacons on fls-na.amazon.com, gno/sprites nav chrome).
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/fls-na\.amazon\.com\/1\/batch|\/gno\/sprites\/|\/uedata\b/.test(src)) {
        const p = img.closest('p, picture');
        (p || img).remove();
      }
    });

    // Promote standalone section headings that arrive as bold paragraphs
    // (the source renders them in styled divs, not real <h*>), so the page keeps
    // a proper heading outline. Match a <p> whose only content is a <strong>.
    element.querySelectorAll('p').forEach((p) => {
      const strong = p.children.length === 1 && p.firstElementChild.tagName === 'STRONG'
        ? p.firstElementChild : null;
      if (!strong) return;
      if (!/frequently asked questions/i.test(strong.textContent)) return;
      const h2 = document.createElement('h2');
      h2.textContent = strong.textContent.trim();
      p.replaceWith(h2);
    });

    // Strip non-authorable tracking attributes wherever present.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-aos');
      el.removeAttribute('data-aos-easing');
      el.removeAttribute('data-aos-duration');
      el.removeAttribute('data-aos-delay');
    });
  }
}
