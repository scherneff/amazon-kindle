/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Amazon Kindle "Your Company Bookshelf" landing site — section breaks
 * and Section Metadata blocks.
 *
 * Driven by payload.template.sections (5 sections for kindle-landing):
 *   rc-hero          style=null   (first section — no leading break, no metadata)
 *   rc-how-it-works  style=grey
 *   rc-features      style=null
 *   rc-testimonials  style=light
 *   rc-faq           style=light
 *
 * Expected on the test page: 4 section breaks (<hr>, one before each non-first
 * section) and 3 Section Metadata blocks (grey, light, light).
 *
 * Selectors come straight from page-templates.json section.selector arrays
 * (verified in migration-work/cleaned.html: .apb-default-merchandised-search-{2,4,5,6}).
 *
 * Break/metadata split across both hooks per the reference implementation: breaks
 * are inserted in beforeTransform while every section element still exists (parsers
 * replace section elements between the hooks); metadata is anchored in afterTransform
 * to the marker <hr> (or the surviving original element for the marker-less first section).
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// Map the analysis "style" name to a Section Metadata value this project understands.
// The Author Kit section-metadata block keys off `background` (a colour or color-token),
// not a generic `style` name — so translate. `light` == the default white page, so it
// needs no metadata row and is dropped.
const STYLE_TO_BACKGROUND = {
  grey: 'color-token-brand-band',
};

function backgroundFor(style) {
  if (!style) return null;
  return STYLE_TO_BACKGROUND[style] || null;
}

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const bg = backgroundFor(section.style);
      if (i === 0 && !bg) continue; // first section: no break, no metadata needed
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched on this page — skip, never guess

      const hr = document.createElement('hr');
      if (bg) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each styled
    // section's Section Metadata block to whichever still exists: the marker <hr> above,
    // or (first section, no marker inserted) the original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const bg = backgroundFor(section.style);
      if (!bg) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { background: bg },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
