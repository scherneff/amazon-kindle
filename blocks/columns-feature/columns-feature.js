export default function init(el) {
  const rows = [...el.children];
  rows.forEach((row, idx) => {
    row.classList.add('columns-feature-row');
    if (idx % 2 === 1) row.classList.add('reversed');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const hasText = col.querySelector('h1, h2, h3, h4, h5, h6, p, a, ul');
      col.classList.add(pic && !hasText ? 'columns-feature-media' : 'columns-feature-text');
    });
  });
}
