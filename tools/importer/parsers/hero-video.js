/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Base: hero.
 * Source: https://www.amazon.com/b?node=121179473011 (.apb-default-merchandised-search-2)
 * Contract (blocks/hero-video/metadata.json + hero-video.js): one row with two cells.
 *   Left cell: eyebrow, heading, intro paragraph, CTA link.
 *   Right cell: a link to the .mp4 video (block JS swaps it for an HTML5 <video>).
 */
export default function parse(element, { document }) {
  // The block-mapping selectors may hand us either the inner `.video` node or a
  // `.has-max-width` wrapper. Anchor on the stable hero section so both text and
  // media are always in scope.
  const region = element.closest('.apb-default-merchandised-search-2') || element;

  // --- Extract source content (validated against cleaned.html) ---
  const eyebrowEl = region.querySelector('.text.color-gulfstream.font-size-medium, .text.bookerly');
  const headingImg = region.querySelector('.image img, img[title]');
  const introEl = region.querySelector('.text.color-gulfstream.font-size-small, .text.font-size-small.ember');
  const ctaLink = region.querySelector('a.link-container[href*="shelf/admin"], a[href*="shelf/admin"]');

  const videoSrc = region.querySelector('video source[src*=".mp4"], source[src*=".mp4"], a[href*=".mp4"]');
  const mp4Url = videoSrc
    ? (videoSrc.getAttribute('src') || videoSrc.getAttribute('href'))
    : null;

  // Empty-block guard: nothing meaningful to build.
  if (!mp4Url && !headingImg && !eyebrowEl) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Build the left (text) cell ---
  const textCell = [];

  if (eyebrowEl && eyebrowEl.textContent.trim()) {
    const eyebrow = document.createElement('p');
    eyebrow.textContent = eyebrowEl.textContent.trim();
    textCell.push(eyebrow);
  }

  if (headingImg) {
    const heading = document.createElement('h1');
    // Use the branded title text as the accessible heading, preferring the image's
    // `title` (concise: "Your Company Bookshelf") over its long descriptive `alt`.
    const headingText = (headingImg.getAttribute('title')
      || headingImg.getAttribute('alt') || '').trim();
    heading.textContent = headingText || 'Your Company Bookshelf';
    textCell.push(heading);
  }

  if (introEl && introEl.textContent.trim()) {
    const intro = document.createElement('p');
    intro.textContent = introEl.textContent.trim();
    textCell.push(intro);
  }

  if (ctaLink) {
    const cta = document.createElement('a');
    cta.href = ctaLink.href;
    const ctaLabel = ctaLink.querySelector('h1, .heading') || ctaLink;
    cta.textContent = ctaLabel.textContent.trim() || 'Create a Bookshelf';
    // Bold => primary button in AEM authoring.
    const strong = document.createElement('strong');
    strong.append(cta);
    textCell.push(strong);
  }

  // --- Build the right (media) cell ---
  const mediaCell = [];
  if (mp4Url) {
    const mediaLink = document.createElement('a');
    mediaLink.href = mp4Url;
    mediaLink.textContent = mp4Url;
    mediaCell.push(mediaLink);
  }

  const cells = [[textCell, mediaCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
