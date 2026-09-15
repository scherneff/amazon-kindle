export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-testimonial-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    const paras = [...li.querySelectorAll('p')];
    const quote = paras[0];
    const attribution = paras[paras.length - 1];
    if (quote) quote.classList.add('cards-testimonial-quote');
    if (attribution && attribution !== quote) attribution.classList.add('cards-testimonial-attribution');

    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
