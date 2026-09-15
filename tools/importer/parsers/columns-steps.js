/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-steps. Base: columns.
 * Source: https://www.amazon.com/b?node=121179473011
 *   (.apb-default-merchandised-search-4 .has-max-width > .flex-container:nth-of-type(1))
 * Contract (blocks/columns-steps/metadata.json + columns-steps.js): one row with N cells,
 *   one cell per step, each holding the step's short label. Numbers are auto-generated.
 *
 * In the source, the four "How it works" steps are baked into a single process image
 * whose alt text enumerates them ("Select Books, Buy Vouchers, We send invites and
 * Recipients read"). We derive one labelled cell per step from that alt text, with a
 * fallback to any per-step text nodes.
 */
export default function parse(element, { document }) {
  let steps = [];

  // Preferred source: the "How it Works" process image alt text.
  const stepsImg = element.querySelector('img[alt*="Select Books"], img[alt*="How it Works"], img[alt*="How it works"]');
  if (stepsImg) {
    let alt = (stepsImg.getAttribute('alt') || '').trim();
    // Drop a leading "How it Works:" style prefix.
    alt = alt.replace(/^how it works\s*:?\s*/i, '');
    // Trim a trailing period.
    alt = alt.replace(/\.\s*$/, '');
    // Split on commas and the final " and " conjunction.
    steps = alt
      .split(/\s*,\s*|\s+and\s+/i)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Fallback: explicit per-step text nodes, if the DOM ever exposes them.
  if (steps.length === 0) {
    const textNodes = element.querySelectorAll('.text, [class*="step"] .text, li');
    steps = Array.from(textNodes)
      .map((n) => n.textContent.trim())
      .filter((t) => t && !/have questions/i.test(t));
  }

  // Empty-block guard.
  if (steps.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row, one cell per step.
  const row = steps.map((label) => {
    const p = document.createElement('p');
    p.textContent = label;
    return p;
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-steps', cells });

  // Preserve the advisor callout ("Have Questions? Contact a Book Advisor.") as
  // default content before the block, keeping its link if present.
  const advisorLink = Array.from(element.querySelectorAll('a'))
    .find((a) => /book advisor|contact a book/i.test(a.textContent));
  let advisorText = '';
  if (!advisorLink) {
    const m = element.textContent.match(/(Have Questions\?[^.]*Book Advisor\.?)/i);
    if (m) advisorText = m[1].trim();
  }

  if (advisorLink || advisorText) {
    const callout = document.createElement('p');
    if (advisorLink) {
      const a = document.createElement('a');
      a.href = advisorLink.href;
      a.textContent = advisorLink.textContent.trim() || 'Contact a Book Advisor';
      callout.append(a);
    } else {
      callout.textContent = advisorText;
    }
    element.replaceWith(callout, block);
  } else {
    element.replaceWith(block);
  }
}
