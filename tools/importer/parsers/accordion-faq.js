/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://www.amazon.com/b?node=121179473011 (.apb-default-merchandised-search-6 ...)
 * Contract (blocks/accordion-faq/metadata.json + accordion): 2 columns, one row per FAQ.
 *   First cell = question (clickable summary); second cell = answer content.
 *
 * Each FAQ in the source is an `.accordion` element holding a `.title` (question, in
 * <strong>) and a `.content` (answer paragraph(s)). Extract every accordion pair in scope
 * so the parser works whether it receives a single FAQ container or a wrapper of many.
 */
export default function parse(element, { document }) {
  // Collect every accordion item within scope; fall back to the element itself.
  let items = Array.from(element.querySelectorAll('.accordion'));
  if (items.length === 0 && element.classList.contains('accordion')) {
    items = [element];
  }

  const cells = [];

  items.forEach((item) => {
    const titleEl = item.querySelector('.title');
    const contentEl = item.querySelector('.content');
    if (!titleEl && !contentEl) return;

    // Question cell.
    const questionText = titleEl ? titleEl.textContent.trim() : '';
    const question = document.createElement('p');
    question.textContent = questionText;

    // Answer cell — preserve paragraphs and inline links.
    const answerCell = [];
    if (contentEl) {
      const paras = contentEl.querySelectorAll('p');
      if (paras.length) {
        paras.forEach((p) => answerCell.push(p.cloneNode(true)));
      } else if (contentEl.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = contentEl.textContent.trim();
        answerCell.push(p);
      }
    }
    // Pad the answer if empty so the row keeps two cells.
    if (answerCell.length === 0) answerCell.push('');

    cells.push([[question], answerCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
