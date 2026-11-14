/**
 * Kosambi Peduli Yatim (KOPY)
 * Script Interaktif Utama (Vanilla JavaScript)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ========================================================================
     1. TAHUN COPYRIGHT DINAMIS
     ======================================================================== */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ========================================================================
     2. HEADER STICKY & EFEK SCROLL + TOMBOL KEMBALI KE ATAS
     ======================================================================== */
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('backToTop');

  function handleScrollEffects() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      if (scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  }

  window.addEventListener('scroll', handleScrollEffects, { passive: true });
  handleScrollEffects();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ========================================================================
     3. HAMBURGER MENU & TUTUP OTOMATIS SAAT NAVIGASI DIPILIH
     ======================================================================== */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function setMenuState(isOpen) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    navMenu.classList.toggle('is-open', isOpen);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const currentlyOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setMenuState(!currentlyOpen);
    });

    // Tutup menu jika area di luar header diklik
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (
        navMenu.classList.contains('is-open') &&
        header &&
        target instanceof Node &&
        !header.contains(target)
      ) {
        setMenuState(false);
      }
    });
  }

  /* ========================================================================
     4. SMOOTH SCROLLING ANCHOR DENGAN OFFSET STICKY HEADER & ACTIVE STATE
     ======================================================================== */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const targetSection = document.querySelector(href);
      if (!targetSection) return;

      event.preventDefault();

      // Tutup menu mobile setelah link navigasi dipilih
      setMenuState(false);

      const headerOffset = header ? header.offsetHeight : 76;
      const elementTop = targetSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementTop - headerOffset);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Tampilkan notifikasi toast jika tautan memiliki atribut data-toast
      const toastMsg = link.getAttribute('data-toast');
      if (toastMsg) {
        showToast(toastMsg);
      }
    });
  });

  // Penanda menu aktif sesuai posisi gulir halaman
  function updateActiveNavLink() {
    const scrollPos = (window.scrollY || window.pageYOffset) + (header ? header.offsetHeight + 40 : 116);
    let currentSectionId = '';

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id') || '';
      }
    });

    if (currentSectionId) {
      navLinks.forEach((navLink) => {
        const isMatch = navLink.getAttribute('href') === `#${currentSectionId}`;
        navLink.classList.toggle('active', isMatch);
      });
    }
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  /* ========================================================================
     5. NOTIFIKASI TOAST SEDERHANA, UNDUH QRIS & SALIN NOMOR REKENING
     ======================================================================== */
  const toastEl = document.getElementById('toast');
  const toastMessageEl = document.getElementById('toastMessage');
  let toastTimeoutId = null;

  function showToast(message) {
    if (!toastEl || !toastMessageEl) return;

    toastMessageEl.textContent = message;
    toastEl.hidden = false;

    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = setTimeout(() => {
      toastEl.hidden = true;
    }, 3500);
  }

  const downloadLinksWithToast = document.querySelectorAll('a[download][data-toast]');
  downloadLinksWithToast.forEach((link) => {
    link.addEventListener('click', () => {
      const toastMsg = link.getAttribute('data-toast');
      if (toastMsg) {
        showToast(toastMsg);
      }
    });
  });

  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const textToCopy = button.getAttribute('data-copy');
      if (!textToCopy) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            showToast(`Nomor rekening ${textToCopy} berhasil disalin.`);
          })
          .catch(() => {
            showToast(`Nomor rekening BCA: ${textToCopy}`);
          });
      } else {
        showToast(`Nomor rekening BCA: ${textToCopy}`);
      }
    });
  });

  /* ========================================================================
     6. LIGHTBOX GALERI KEGIATAN
     ======================================================================== */
  const galleryButtons = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;
  let lastFocusedElement = null;

  function renderLightboxItem(index) {
    if (!galleryButtons.length || !lightboxImg || !lightboxTitle || !lightboxCaption || !lightboxCounter) {
      return;
    }

    const total = galleryButtons.length;
    currentGalleryIndex = (index + total) % total;

    const item = galleryButtons[currentGalleryIndex];
    const img = item.querySelector('img');
    const title = item.getAttribute('data-title') || 'Dokumentasi Kegiatan KOPY';
    const caption = item.getAttribute('data-caption') || '';

    if (img) {
      lightboxImg.src = img.getAttribute('src') || img.src;
      lightboxImg.alt = img.alt || title;
    }

    lightboxTitle.textContent = title;
    lightboxCaption.textContent = caption;
    lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${total}`;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocusedElement = document.activeElement;
    renderLightboxItem(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  galleryButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => openLightbox(idx));
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => renderLightboxItem(currentGalleryIndex - 1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => renderLightboxItem(currentGalleryIndex + 1));
  }

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  /* ========================================================================
     7. MODAL INFORMASI PARTISIPASI
     ======================================================================== */
  const supportModal = document.getElementById('supportModal');
  const openSupportModalBtn = document.getElementById('openSupportModal');
  const closeSupportModalX = document.getElementById('closeSupportModal');
  const closeSupportModalBtn = document.getElementById('closeSupportModalBtn');

  function openSupportModal() {
    if (!supportModal) return;
    lastFocusedElement = document.activeElement;
    supportModal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (closeSupportModalX) {
      closeSupportModalX.focus();
    }
  }

  function closeSupportModal() {
    if (!supportModal || supportModal.hidden) return;
    supportModal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  if (openSupportModalBtn) {
    openSupportModalBtn.addEventListener('click', openSupportModal);
  }

  if (closeSupportModalX) {
    closeSupportModalX.addEventListener('click', closeSupportModal);
  }

  if (closeSupportModalBtn) {
    closeSupportModalBtn.addEventListener('click', closeSupportModal);
  }

  if (supportModal) {
    supportModal.addEventListener('click', (event) => {
      if (event.target === supportModal) {
        closeSupportModal();
      }
    });
  }

  /* ========================================================================
     8. NAVIGASI KEYBOARD GLOBAL (ESCAPE & PANAH LIGHTBOX)
     ======================================================================== */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (navMenu && navMenu.classList.contains('is-open')) {
        setMenuState(false);
      }
      if (lightbox && !lightbox.hidden) {
        closeLightbox();
      }
      if (supportModal && !supportModal.hidden) {
        closeSupportModal();
      }
    }

    if (lightbox && !lightbox.hidden) {
      if (event.key === 'ArrowLeft') {
        renderLightboxItem(currentGalleryIndex - 1);
      } else if (event.key === 'ArrowRight') {
        renderLightboxItem(currentGalleryIndex + 1);
      }
    }
  });
});
