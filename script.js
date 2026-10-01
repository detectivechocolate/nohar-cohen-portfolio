const featuredFrame = document.querySelector('.featured-frame');
const featuredPieceCurrent = document.querySelector('.featured-piece--current');
const featuredPieceNext = document.querySelector('.featured-piece--next');
const artworks = [
  { label: 'Topography of Time', style: 'preview-1' },
  { label: 'Kol Nidrei', style: 'preview-2' },
  { label: 'A field with people near my house', style: 'preview-3' },
  { label: 'circle', style: 'preview-4' },
  { label: 'Archive of Unknown Places', style: 'preview-5' },
  { label: 'Hiroshige: Case study', style: 'preview-6' },
];

if (featuredFrame && featuredPieceCurrent && featuredPieceNext) {
  let artworkIndex = 0;
  let activePieceIndex = 0;
  let rotationTimer;

  const setArtwork = (piece, artwork) => {
    piece.classList.remove(...artworks.map((item) => item.style));
    piece.classList.add(artwork.style);
    piece.setAttribute('aria-label', `Artwork preview: ${artwork.label}`);
  };

  const showArtwork = (index) => {
    const nextIndex = (index + artworks.length) % artworks.length;
    const nextArt = artworks[nextIndex];
    const currentPiece = [featuredPieceCurrent, featuredPieceNext][activePieceIndex];
    const incomingPiece = [featuredPieceCurrent, featuredPieceNext][(activePieceIndex + 1) % 2];

    setArtwork(incomingPiece, nextArt);
    incomingPiece.setAttribute('aria-hidden', 'false');
    currentPiece.setAttribute('aria-hidden', 'true');

    incomingPiece.style.opacity = '1';
    incomingPiece.style.filter = 'blur(0) brightness(1) saturate(1)';
    currentPiece.style.opacity = '0';
    currentPiece.style.filter = 'blur(1.2px) brightness(0.94) saturate(0.9)';

    window.setTimeout(() => {
      artworkIndex = nextIndex;
      activePieceIndex = (activePieceIndex + 1) % 2;
      currentPiece.classList.remove(...artworks.map((item) => item.style));
      currentPiece.style.opacity = '0';
      currentPiece.style.filter = 'blur(1.2px) brightness(0.94) saturate(0.9)';
    }, 1200);
  };

  const stopRotation = () => window.clearInterval(rotationTimer);
  const startRotation = () => {
    stopRotation();
    if (!document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rotationTimer = window.setInterval(() => showArtwork(artworkIndex + 1), 5000);
    }
  };

  featuredFrame.addEventListener('mouseenter', stopRotation);
  featuredFrame.addEventListener('mouseleave', startRotation);
  document.addEventListener('visibilitychange', startRotation);

  setArtwork(featuredPieceCurrent, artworks[0]);
  featuredPieceCurrent.style.opacity = '1';
  featuredPieceCurrent.style.filter = 'blur(0) brightness(1) saturate(1)';
  featuredPieceNext.style.opacity = '0';
  featuredPieceNext.style.filter = 'blur(1.2px) brightness(0.94) saturate(0.9)';
  featuredPieceCurrent.setAttribute('aria-label', `Artwork preview: ${artworks[0].label}`);
  featuredPieceCurrent.setAttribute('aria-hidden', 'false');
  featuredPieceNext.setAttribute('aria-hidden', 'true');

  startRotation();
}

const artworkZoomButtons = document.querySelectorAll('.artwork-zoom');
const artworkLightbox = document.querySelector('.artwork-lightbox');
const lightboxImage = artworkLightbox?.querySelector('img');
const lightboxClose = artworkLightbox?.querySelector('.lightbox-close');
const lightboxZoom = artworkLightbox?.querySelector('.lightbox-zoom');

if (artworkLightbox && lightboxImage && lightboxClose && lightboxZoom) {
  const setZoom = (isZoomed) => {
    artworkLightbox.classList.toggle('is-zoomed', isZoomed);
    lightboxZoom.setAttribute('aria-pressed', String(isZoomed));
    lightboxZoom.textContent = isZoomed ? 'Zoom out' : 'Zoom in';
  };

  artworkZoomButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sourceImage = button.querySelector('img');
      lightboxImage.src = sourceImage.src;
      lightboxImage.alt = sourceImage.alt;
      setZoom(false);
      artworkLightbox.showModal();
    });
  });

  lightboxZoom.addEventListener('click', () => {
    setZoom(!artworkLightbox.classList.contains('is-zoomed'));
  });
  lightboxImage.addEventListener('click', () => {
    setZoom(!artworkLightbox.classList.contains('is-zoomed'));
  });
  lightboxClose.addEventListener('click', () => artworkLightbox.close());
  artworkLightbox.addEventListener('close', () => setZoom(false));
  artworkLightbox.addEventListener('click', (event) => {
    if (event.target === artworkLightbox) artworkLightbox.close();
  });
}


