const tree = document.querySelector('#archive-tree');
const search = document.querySelector('#archive-search');
const recordButtons = [...document.querySelectorAll('.archive-record')];
const detailTitle = document.querySelector('#archive-record-title');
const detailDescription = document.querySelector('#archive-record-description');
const detailReference = document.querySelector('#archive-reference');
const detailSeries = document.querySelector('#archive-series-name');
const detailRecord = document.querySelector('#archive-record-name');
const breadcrumb = document.querySelector('#archive-breadcrumb');
const resultCount = document.querySelector('#archive-result-count');
const imageGrid = document.querySelector('#archive-image-grid');
const imageDialog = document.querySelector('#archive-image-dialog');
const imageClose = document.querySelector('#archive-image-close');
const zoomImage = document.querySelector('#archive-zoom-image');
const zoomCaption = document.querySelector('#archive-zoom-caption');

const seriesNames = {
  A: 'Architecture',
  B: 'Occupation',
  C: 'Fragments',
  D: 'Research Records',
};
const seriesDescriptions = {
  A: 'Series A contains architectural records relating to the physical organization of Site 01. These documents trace structural systems and spatial arrangements that form the site\'s architectural framework. These materials provide primary evidence of how the site was constructed and organized.',
  B: 'Series B contains records documenting human activity within the site. The materials depict commerce, gathering, and everyday interactions occurring within the built environment. Together, they show how people inhabited, adapted, and used architectural spaces over time.',
  C: 'Series C contains documentation of surviving architectural remains and recovered evidence. They preserve partial spaces, architectural details, and material traces that allow the site to be reconstructed and reinterpreted.',
  D: 'Series D stands apart from previous series by making visible the archive’s creator\'s dual approach—as both archivist and artist. In this way, Series D embodies the coexistence of methodical record-keeping and artistic inquiry within a single practice by arranging trays and grouping pieces to create provisional relationships.',
};
const formatReference = (reference) => reference
  .replace(/^File\s+/, '')
  .replace(/^([A-D])\./, 'arch-up-01-$1-');

recordButtons.forEach((record) => {
  const code = record.querySelector('span:first-child');
  if (code) code.textContent = formatReference(record.dataset.ref);
});

const selectRecord = (record) => {
  recordButtons.forEach((button) => button.classList.toggle('is-selected', button === record));
  const series = record.dataset.series;
  const parentRecord = record.dataset.parent
    ? recordButtons.find((button) => button.dataset.record === record.dataset.parent)
    : record;
  const activeDescriptionRecord = record.dataset.description ? record : (parentRecord || record);
  detailTitle.textContent = record.dataset.title;
  detailDescription.textContent = activeDescriptionRecord.dataset.description || '';
  detailDescription.hidden = !activeDescriptionRecord.dataset.description;
  detailReference.textContent = formatReference(record.dataset.ref);
  detailSeries.textContent = `${series} / ${seriesNames[series]}`;
  detailRecord.textContent = formatReference(record.dataset.ref);
  breadcrumb.innerHTML = record.dataset.parent
    ? `Fonds 01 <span>/</span> Site 01 <span>/</span> Series ${series} <span>/</span> ${seriesNames[series]} <span>/</span> ${formatReference(parentRecord.dataset.ref)} <span>/</span> ${formatReference(record.dataset.ref)}`
    : `Fonds 01 <span>/</span> Site 01 <span>/</span> Series ${series} <span>/</span> ${seriesNames[series]}`;

  const images = record.dataset.image
    ? [record]
    : recordButtons.filter((button) => button.dataset.parent === record.dataset.record);
  imageGrid.replaceChildren();
  images.forEach((imageRecord) => {
    const figure = document.createElement('figure');
    const imageButton = document.createElement('button');
    const image = document.createElement('img');
    const caption = document.createElement('figcaption');
    figure.className = 'archive-image-item';
    imageButton.className = 'archive-image-open';
    imageButton.type = 'button';
    imageButton.setAttribute('aria-label', `Enlarge image ${formatReference(imageRecord.dataset.ref)}`);
    image.width = Number(imageRecord.dataset.imageWidth);
    image.height = Number(imageRecord.dataset.imageHeight);
    image.src = imageRecord.dataset.image;
    image.alt = imageRecord.dataset.imageAlt;
    image.loading = 'lazy';
    image.classList.toggle('archive-image-rotated', ['B.01.01', 'B.01.02', 'B.01.03'].includes(imageRecord.dataset.ref));
    image.classList.toggle('archive-image-rotated-counterclockwise', imageRecord.dataset.ref === 'C.02.02');
    caption.textContent = formatReference(imageRecord.dataset.ref);
    imageButton.append(image);
    figure.append(imageButton, caption);
    imageGrid.append(figure);
  });
  imageGrid.hidden = images.length === 0;
};

const selectSeries = (series) => {
  const seriesNode = document.querySelector(`.archive-series[data-series="${series}"] .archive-node`);
  recordButtons.forEach((button) => button.classList.remove('is-selected'));
  tree.querySelectorAll('.archive-node').forEach((node) => node.classList.toggle('is-selected', node === seriesNode));
  detailTitle.textContent = `Series ${series}`;
  detailDescription.textContent = seriesDescriptions[series];
  detailDescription.hidden = false;
  detailReference.textContent = `SERIES ${series}`;
  detailSeries.textContent = `${series} / ${seriesNames[series]}`;
  detailRecord.textContent = `Series ${series} overview`;
  breadcrumb.innerHTML = `Fonds 01 <span>/</span> Site 01 <span>/</span> Series ${series} <span>/</span> ${seriesNames[series]}`;
  imageGrid.replaceChildren();
  imageGrid.hidden = true;
};

imageGrid.addEventListener('click', (event) => {
  const imageButton = event.target.closest('.archive-image-open');
  if (!imageButton) return;

  const image = imageButton.querySelector('img');
  zoomImage.src = image.currentSrc || image.src;
  zoomImage.alt = image.alt;
  zoomImage.classList.toggle('archive-image-rotated', image.classList.contains('archive-image-rotated'));
  zoomImage.classList.toggle('archive-image-rotated-counterclockwise', image.classList.contains('archive-image-rotated-counterclockwise'));
  zoomCaption.textContent = imageButton.getAttribute('aria-label').replace('Enlarge image ', '');
  imageDialog.showModal();
});

imageClose.addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', (event) => {
  if (event.target === imageDialog) imageDialog.close();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && imageDialog.open) imageDialog.close();
});
imageDialog.addEventListener('close', () => {
  zoomImage.removeAttribute('src');
  zoomImage.alt = '';
  zoomImage.classList.remove('archive-image-rotated');
  zoomImage.classList.remove('archive-image-rotated-counterclockwise');
});

tree.addEventListener('click', (event) => {
  const node = event.target.closest('.archive-node');
  const record = event.target.closest('.archive-record');

  if (record) {
    selectRecord(record);
    return;
  }

  if (node) {
    const children = node.closest('.archive-series')?.querySelector('.archive-records') || node.nextElementSibling;
    if (children?.classList.contains('archive-children')) {
      const expanded = node.getAttribute('aria-expanded') !== 'false';
      node.setAttribute('aria-expanded', String(!expanded));
      children.hidden = expanded;
    }
    const series = node.closest('.archive-series')?.dataset.series;
    if (series) {
      selectSeries(series);
    } else {
      tree.querySelectorAll('.archive-node').forEach((item) => item.classList.toggle('is-selected', item === node));
    }
  }
});

search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  let visibleCount = 0;

  recordButtons.forEach((record) => {
    const matches = `${record.dataset.title} ${record.dataset.ref} ${formatReference(record.dataset.ref)} ${record.dataset.category}`.toLowerCase().includes(query);
    record.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  document.querySelectorAll('.archive-series').forEach((series) => {
    const hasVisibleRecords = series.querySelector('.archive-record:not([hidden])');
    series.hidden = Boolean(query) && !hasVisibleRecords;
    const node = series.querySelector('.archive-node');
    const children = series.querySelector('.archive-records');
    if (query && hasVisibleRecords) {
      node.setAttribute('aria-expanded', 'true');
      children.hidden = false;
    }
  });

  resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'record' : 'records'}`;
  if (query && visibleCount === 0) resultCount.textContent = 'No matching records';
});

selectRecord(document.querySelector('.archive-record.is-selected'));