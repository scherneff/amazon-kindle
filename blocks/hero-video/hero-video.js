function buildVideo(link) {
  const video = document.createElement('video');
  video.src = link.href;
  video.controls = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'metadata');
  return video;
}

function decorateText(cell) {
  cell.classList.add('hero-video-text');
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('hero-video-heading');
    const eyebrow = heading.previousElementSibling;
    if (eyebrow) eyebrow.classList.add('hero-video-eyebrow');
  }
}

export default async function init(el) {
  const cells = [...el.querySelectorAll(':scope > div > div')];
  // The media cell holds the video: prefer a cell with an mp4 link or a <video>.
  // A bare <picture> alone doesn't qualify — the text cell can carry a title image,
  // so matching on picture would misidentify it as the media cell.
  const mediaCell = cells.find((c) => c.querySelector('a[href*=".mp4"], video'))
    || cells[cells.length - 1];
  const textCells = cells.filter((c) => c !== mediaCell);

  textCells.forEach(decorateText);

  if (mediaCell) {
    mediaCell.classList.add('hero-video-media');
    const vidLink = mediaCell.querySelector('a[href*=".mp4"]');
    if (vidLink) {
      vidLink.replaceWith(buildVideo(vidLink));
    }
  }
}
