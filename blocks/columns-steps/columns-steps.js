export default function init(el) {
  const rows = [...el.children];
  // Steps may be authored as one row of N cells, or N rows of one cell each.
  const cells = rows.length === 1
    ? [...rows[0].children]
    : rows.map((row) => row.firstElementChild || row);

  el.textContent = '';

  // Lead label ("How it works") — sits before the numbered steps, no badge.
  const intro = document.createElement('div');
  intro.className = 'columns-steps-intro';
  intro.textContent = 'How it works';
  el.append(intro);

  cells.forEach((cell, idx) => {
    const step = document.createElement('div');
    step.className = 'columns-steps-step';

    const badge = document.createElement('span');
    badge.className = 'columns-steps-number';
    badge.textContent = idx + 1;

    const label = document.createElement('div');
    label.className = 'columns-steps-label';
    while (cell.firstChild) label.append(cell.firstChild);

    step.append(badge, label);
    el.append(step);
  });
}
