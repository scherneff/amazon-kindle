/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: https://www.amazon.com/b?node=121179473011 (.apb-default-merchandised-search-4 .has-max-width)
 * Contract (blocks/columns-feature/metadata.json + columns-feature.js): one row per feature,
 *   each row has two cells — one holding the feature image, the other the heading, paragraph
 *   and optional CTA. Image/text sides alternate automatically.
 *
 * In the source each feature is a `.flex-align-items-center` container holding a jpg image
 * plus an h3 heading, a paragraph, and (last feature only) a "Create a Bookshelf" CTA.
 */
export default function parse(element, { document }) {
  // Feature rows are the centred flex containers that carry an h3 heading.
  const containers = Array.from(element.querySelectorAll('.flex-align-items-center'))
    .filter((c) => c.querySelector('h3, .heading') && c.querySelector('img'));

  // Deduplicate nested matches: keep only the outermost feature container.
  const featureRows = containers.filter(
    (c) => !containers.some((other) => other !== c && other.contains(c)),
  );

  const cells = [];

  featureRows.forEach((row) => {
    const heading = row.querySelector('h3, .heading');
    const paragraph = row.querySelector('.text.color-granite, .text.font-size-small');
    // First image is the feature illustration (a later img may be a CTA icon).
    const img = row.querySelector('img');
    const ctaLink = row.querySelector('a.link-container[href*="shelf/admin"], a[href*="shelf/admin"]');

    if (!heading && !paragraph) return;

    // Image cell.
    const imageCell = [];
    if (img) imageCell.push(img.cloneNode(true));

    // Text cell.
    const textCell = [];
    if (heading && heading.textContent.trim()) {
      // Top-level feature titles → h2 so the page keeps a gap-free outline
      // (H1 hero → H2 feature/section headings), avoiding an H1→H3 skip.
      const h = document.createElement('h2');
      h.textContent = heading.textContent.trim();
      textCell.push(h);
    }
    if (paragraph && paragraph.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = paragraph.textContent.trim();
      textCell.push(p);
    }
    if (ctaLink) {
      const cta = document.createElement('a');
      cta.href = ctaLink.href;
      const label = ctaLink.querySelector('.text, h1, .heading') || ctaLink;
      cta.textContent = label.textContent.trim() || 'Create a Bookshelf';
      const strong = document.createElement('strong');
      strong.append(cta);
      textCell.push(strong);
    }

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard: leave the element untouched (it may hold sibling blocks
  // such as the how-it-works steps that another parser owns).
  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });

  // The mapped element may be a shared container that also holds other blocks
  // (e.g. the advisor/how-it-works row). Replace only the feature rows we consumed
  // — resolved to their outermost descendant of `element` — instead of the whole
  // container, so neighbouring blocks are preserved.
  const consumed = [];
  featureRows.forEach((row) => {
    let node = row;
    while (node.parentElement && node.parentElement !== element) node = node.parentElement;
    if (node.parentElement === element && !consumed.includes(node)) consumed.push(node);
  });

  if (consumed.length) {
    element.insertBefore(block, consumed[0]);
    consumed.forEach((node) => node.remove());
  } else {
    element.replaceWith(block);
  }
}
