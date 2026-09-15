/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-testimonial. Base: cards (no images).
 * Source: https://www.amazon.com/b?node=121179473011 (.apb-default-merchandised-search-5 .desktop > .flex-container)
 * Contract (blocks/cards-testimonial/metadata.json + cards-testimonial.js): 1 column,
 *   one row per testimonial. Each cell holds a quote paragraph followed by an attribution
 *   paragraph (first <p> = quote, last <p> = attribution). Text-only, no imagery.
 *
 * In the source each testimonial is a `.text` div where the quote and attribution are
 * separated by <br><br>, with the attribution prefixed by "- ".
 */
export default function parse(element, { document }) {
  // Testimonial bodies: quote text divs (exclude the section heading).
  const textDivs = Array.from(element.querySelectorAll('.text.color-gulfstream, .text.font-size-small'))
    .filter((d) => /"|”|“/.test(d.textContent) || /^\s*[-–]/.test(d.textContent));

  const cells = [];

  textDivs.forEach((div) => {
    // Split the div's content on <br> runs into quote vs attribution.
    const segments = [];
    let current = '';
    div.childNodes.forEach((node) => {
      if (node.nodeName === 'BR') {
        if (current.trim()) segments.push(current.trim());
        current = '';
      } else {
        current += node.textContent;
      }
    });
    if (current.trim()) segments.push(current.trim());

    if (segments.length === 0) return;

    // First segment = quote; a segment beginning with a dash = attribution.
    const quoteText = segments[0];
    const attrText = segments
      .slice(1)
      .find((s) => /^[-–]/.test(s)) || (segments.length > 1 ? segments[segments.length - 1] : '');

    const cell = [];
    const quote = document.createElement('p');
    quote.textContent = quoteText;
    cell.push(quote);

    if (attrText) {
      const attr = document.createElement('p');
      // Preserve the leading dash attribution as authored.
      attr.append(document.createElement('em'));
      attr.firstChild.textContent = attrText;
      cell.push(attr);
    }

    cells.push([cell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-testimonial', cells });

  // Preserve the section heading ("What our customers are saying?") as default
  // content before the block, if present in scope.
  const headingEl = Array.from(element.querySelectorAll('h1, h2, h3, h4, .heading'))
    .find((h) => /customers are saying/i.test(h.textContent));
  let headingText = headingEl ? headingEl.textContent.trim() : '';
  if (!headingText) {
    // Heading may be a bare text node (no heading tag); recover it from the leading text.
    const m = element.textContent.match(/(What our customers are saying\??)/i);
    if (m) headingText = m[1];
  }

  if (headingText) {
    const heading = document.createElement('h2');
    heading.textContent = headingText;
    element.replaceWith(heading, block);
  } else {
    element.replaceWith(block);
  }
}
