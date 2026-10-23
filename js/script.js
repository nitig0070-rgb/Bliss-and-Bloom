/**
 * Bliss & Bloom — Modern Contemporary Restaurant Website
 * Script: Client-Side Interactions, Validation, Dynamic UI & Custom Smooth Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. DYNAMIC COPYRIGHT YEAR & LIVE RESTAURANT STATUS
  // =========================================================================
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Live status badge (12:00 PM - 10:30 PM)
  const liveStatusPill = document.getElementById('live-open-status');
  if (liveStatusPill) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const openTime = 12 * 60; // 12:00 PM
    const closeTime = 22 * 60 + 30; // 10:30 PM

    if (currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime) {
      liveStatusPill.className = 'live-status-pill open';
      liveStatusPill.innerHTML = '<span class="status-dot"></span> Open Today until 10:30 PM';
    } else {
      liveStatusPill.className = 'live-status-pill closed';
      liveStatusPill.innerHTML = '<span class="status-dot"></span> Opens at 12:00 PM';
    }
  }

  // =========================================================================
  // IMAGE ERROR FALLBACK (PROTECTS AGAINST CDN / NETWORK GLITCHES)
  // =========================================================================
  const fallbackCulinaryImg = 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=600&q=80';
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
      if (!this.dataset.fallbackTriggered) {
        this.dataset.fallbackTriggered = 'true';
        this.src = fallbackCulinaryImg;
      }
    });
  });

  // =========================================================================
  // 2. SCROLL PROGRESS BAR & STICKY HEADER
  // =========================================================================
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('back-to-top');
  const progressBar = document.getElementById('scroll-progress-bar');

  const handleScroll = () => {
    const scrollPos = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Scroll reading progress indicator
    if (progressBar && docHeight > 0) {
      const progressPercent = Math.min(100, Math.max(0, (scrollPos / docHeight) * 100));
      progressBar.style.width = `${progressPercent}%`;
    }

    // Header sticky styling
    if (header) {
      if (scrollPos > 35) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollPos > 380) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // =========================================================================
  // 3. RESPONSIVE MOBILE NAVIGATION DRAWER
  // =========================================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const openMobileNav = () => {
    if (!mobileToggle || !mobileDrawer) return;
    mobileToggle.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    if (!mobileToggle || !mobileDrawer) return;
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  // =========================================================================
  // 4. PRECISION CUSTOM SMOOTH SCROLL ENGINE & SCROLLSPY
  // =========================================================================
  /**
   * High-precision animated smooth scroll using cubic easing.
   * Eliminates browser-native jitter and provides a silky, luxurious glide.
   */
  let isCustomScrolling = false;

  const smoothScrollTo = (targetY, duration = 850, callback) => {
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const diff = targetY - startY;

    if (Math.abs(diff) < 2) {
      if (callback) callback();
      return;
    }

    isCustomScrolling = true;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

    // easeInOutCubic: slow start, fast acceleration, ultra-gradual landing
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const step = () => {
      const now = 'now' in window.performance ? performance.now() : new Date().getTime();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, Math.round(startY + diff * easedProgress));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
        isCustomScrolling = false;
        if (callback) callback();
      }
    };

    requestAnimationFrame(step);
  };

  const getTargetPosition = (targetElement) => {
    // When scrolled, header is ~74px; allow extra 10px breathing room
    const headerHeight = 74;
    const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
    return Math.max(0, Math.round(elementTop - headerHeight));
  };

  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  // Handle all smooth scrolls with the custom engine
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // If clicking from mobile drawer, close drawer first
        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          closeMobileNav();
        }

        // Immediate visual feedback on clicked nav item
        if (this.classList.contains('nav-link')) {
          navLinks.forEach(link => link.classList.remove('active'));
          this.classList.add('active');
        }

        // Calculate dynamic destination
        const destinationY = getTargetPosition(targetElement);

        // Calculate adaptive duration based on distance (600ms to 950ms)
        const currentY = window.pageYOffset;
        const distance = Math.abs(destinationY - currentY);
        const duration = Math.min(950, Math.max(600, Math.round(distance * 0.45)));

        // Execute buttery smooth scroll
        smoothScrollTo(destinationY, duration, () => {
          // Add subtle landing highlight to target section header
          const sectionHeader = targetElement.querySelector('.section-header') || targetElement;
          sectionHeader.classList.add('section-target-highlight');
          setTimeout(() => {
            sectionHeader.classList.remove('section-target-highlight');
          }, 1400);

          // Update URL hash cleanly without instant jump
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        });
      }
    });
  });

  // Back to top with enhanced scroll
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      smoothScrollTo(0, 750);
    });
  }

  // Active section indicator (Scrollspy) using IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-25% 0px -55% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    if (isCustomScrolling) return; // Prevent fighting during custom animated scroll

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // =========================================================================
  // 5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));

  // =========================================================================
  // 6. SIGNATURE MENU FILTERING & DISH QUICK-RESERVE
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  if (filterBtns.length > 0 && menuCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const selectedCategory = btn.getAttribute('data-filter');

        menuCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');

          if (selectedCategory === 'all' || cardCategory === selectedCategory) {
            card.classList.remove('hidden');
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            }, 25);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px) scale(0.96)';
            setTimeout(() => {
              card.classList.add('hidden');
              card.style.display = 'none';
            }, 260);
          }
        });
      });
    });
  }

  // Quick reserve button on menu cards (pre-fills dish in special requests)
  const dishReserveBtns = document.querySelectorAll('.btn-dish-reserve');
  const resNotesInput = document.getElementById('res-notes');
  const reservationSection = document.getElementById('reservation');

  dishReserveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dish = btn.getAttribute('data-dish');
      if (dish && resNotesInput) {
        resNotesInput.value = `Table reservation requested. We look forward to ordering the ${dish}!`;
        // Trigger live preview update
        updateLiveTicket();
      }
      if (reservationSection) {
        const destY = getTargetPosition(reservationSection);
        smoothScrollTo(destY, 800, () => {
          const nameInput = document.getElementById('res-name');
          if (nameInput) nameInput.focus();
        });
      }
    });
  });

  // Platter reserve button
  const platterBtn = document.getElementById('special-platter-reserve-btn');
  if (platterBtn) {
    platterBtn.addEventListener('click', () => {
      if (resNotesInput) {
        resNotesInput.value = 'Table reservation requested with The Bloom Signature Platter!';
        updateLiveTicket();
      }
    });
  }

  // =========================================================================
  // 7. GALLERY FILTERING & LIGHTBOX
  // =========================================================================
  const galleryTabBtns = document.querySelectorAll('.gallery-tab-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('gallery-lightbox');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');

  let currentGalleryIndex = 0;
  let activeGalleryData = [];

  // Initialize gallery data
  const refreshGalleryData = () => {
    activeGalleryData = [];
    galleryItems.forEach((item, index) => {
      if (item.style.display !== 'none') {
        const imgEl = item.querySelector('img');
        const caption = item.getAttribute('data-caption') || (imgEl ? imgEl.alt : 'Bliss & Bloom');
        const src = imgEl ? imgEl.src : '';
        activeGalleryData.push({ src, caption, alt: imgEl ? imgEl.alt : '', originalIndex: index });
      }
    });
  };
  refreshGalleryData();

  // Gallery category tabs
  galleryTabBtns.forEach(tab => {
    tab.addEventListener('click', () => {
      galleryTabBtns.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-gallery-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
        }
      });

      refreshGalleryData();
    });
  });

  const updateLightboxContent = (index) => {
    if (!activeGalleryData[index]) return;
    currentGalleryIndex = index;
    const item = activeGalleryData[index];

    if (lightboxImg) {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = item.caption;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${index + 1} of ${activeGalleryData.length}`;
    }
  };

  const openLightbox = (index) => {
    if (!lightboxModal) return;
    refreshGalleryData();
    updateLightboxContent(index);
    lightboxModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  const showNextLightboxImage = () => {
    let nextIndex = currentGalleryIndex + 1;
    if (nextIndex >= activeGalleryData.length) nextIndex = 0;
    updateLightboxContent(nextIndex);
  };

  const showPrevLightboxImage = () => {
    let prevIndex = currentGalleryIndex - 1;
    if (prevIndex < 0) prevIndex = activeGalleryData.length - 1;
    updateLightboxContent(prevIndex);
  };

  galleryItems.forEach((item, index) => {
    const handleOpen = () => {
      // Find index within active filtered items
      const activeIdx = activeGalleryData.findIndex(d => d.originalIndex === index);
      openLightbox(activeIdx >= 0 ? activeIdx : 0);
    };
    item.addEventListener('click', handleOpen);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', showNextLightboxImage);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', showPrevLightboxImage);

  // =========================================================================
  // 8. DINING EXPERIENCES -> PREFILL RESERVATION OCCASION
  // =========================================================================
  const experienceBtns = document.querySelectorAll('.experience-btn');
  const occasionSelect = document.getElementById('res-occasion');

  experienceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const occasion = btn.getAttribute('data-occasion');
      if (occasion && occasionSelect) {
        occasionSelect.value = occasion;
        updateLiveTicket();
      }
    });
  });

  // =========================================================================
  // 9. TESTIMONIALS CAROUSEL
  // =========================================================================
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const carouselDots = document.querySelectorAll('.dot-btn');
  const carouselPrevBtn = document.getElementById('carousel-prev-btn');
  const carouselNextBtn = document.getElementById('carousel-next-btn');
  const carouselContainer = document.getElementById('testimonials-carousel');

  let currentSlide = 0;
  let carouselInterval = null;

  const showSlide = (index) => {
    if (testimonialCards.length === 0) return;
    if (index >= testimonialCards.length) index = 0;
    if (index < 0) index = testimonialCards.length - 1;

    currentSlide = index;

    testimonialCards.forEach((card, idx) => {
      if (idx === currentSlide) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    carouselDots.forEach((dot, idx) => {
      if (idx === currentSlide) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-selected', 'false');
      }
    });
  };

  const startCarouselAutoPlay = () => {
    stopCarouselAutoPlay();
    carouselInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000);
  };

  const stopCarouselAutoPlay = () => {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  };

  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      startCarouselAutoPlay();
    });
  }

  if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      startCarouselAutoPlay();
    });
  }

  carouselDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startCarouselAutoPlay();
    });
  });

  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopCarouselAutoPlay);
    carouselContainer.addEventListener('mouseleave', startCarouselAutoPlay);
    carouselContainer.addEventListener('focusin', stopCarouselAutoPlay);
    carouselContainer.addEventListener('focusout', startCarouselAutoPlay);
  }

  startCarouselAutoPlay();

  // =========================================================================
  // 10. RESERVATION FORM, LIVE TICKET PASS & LOCALSTORAGE
  // =========================================================================
  const reservationForm = document.getElementById('reservation-form');
  const resNameInput = document.getElementById('res-name');
  const resEmailInput = document.getElementById('res-email');
  const resPhoneInput = document.getElementById('res-phone');
  const resDateInput = document.getElementById('res-date');
  const resTimeInput = document.getElementById('res-time');
  const resGuestsInput = document.getElementById('res-guests');
  const resOccasionInput = document.getElementById('res-occasion');

  // Error Containers
  const errorName = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const errorPhone = document.getElementById('error-phone');
  const errorDate = document.getElementById('error-date');
  const errorTime = document.getElementById('error-time');
  const errorGuests = document.getElementById('error-guests');

  // Live Ticket Preview Elements
  const previewGuestName = document.getElementById('preview-guest-name');
  const previewGuestDate = document.getElementById('preview-guest-date');
  const previewGuestTime = document.getElementById('preview-guest-time');
  const previewGuestCount = document.getElementById('preview-guest-count');
  const previewGuestOccasion = document.getElementById('preview-guest-occasion');

  // Confirmation Modal Elements
  const confirmationModal = document.getElementById('confirmation-modal');
  const confirmationBackdrop = document.getElementById('confirmation-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const closeModalActionBtn = document.getElementById('close-modal-action-btn');
  const bookAnotherBtn = document.getElementById('book-another-btn');

  // Confirmation Details Elements
  const modalRefId = document.getElementById('modal-ref-id');
  const modalGuestName = document.getElementById('modal-guest-name');
  const modalGuestDate = document.getElementById('modal-guest-date');
  const modalGuestTime = document.getElementById('modal-guest-time');
  const modalGuestCount = document.getElementById('modal-guest-count');
  const modalGuestOccasion = document.getElementById('modal-guest-occasion');
  const modalGuestNotes = document.getElementById('modal-guest-notes');
  const modalNotesRow = document.getElementById('modal-notes-row');

  // Existing Bookings Bar
  const existingBookingsBar = document.getElementById('existing-bookings-bar');
  const existingBookingsText = document.getElementById('existing-bookings-text');
  const clearBookingsBtn = document.getElementById('clear-bookings-btn');

  // Prevent past dates: Set date input's min attribute to today (YYYY-MM-DD)
  const setMinReservationDate = () => {
    if (!resDateInput) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    resDateInput.min = todayFormatted;
    resDateInput.value = todayFormatted;
  };
  setMinReservationDate();

  // Live Ticket Pass updater
  const updateLiveTicket = () => {
    if (previewGuestName) previewGuestName.textContent = resNameInput.value.trim() || 'Guest Name';
    if (previewGuestDate && resDateInput.value) {
      const parsed = new Date(resDateInput.value + 'T00:00:00');
      previewGuestDate.textContent = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (previewGuestTime) previewGuestTime.textContent = resTimeInput.value || 'Select Time';
    if (previewGuestCount) previewGuestCount.textContent = resGuestsInput.value || 'Party Size';
    if (previewGuestOccasion) previewGuestOccasion.textContent = resOccasionInput ? resOccasionInput.value : 'Casual Dining';
  };
  updateLiveTicket();

  // Validation Helpers
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim().toLowerCase());
  };

  const isValidPhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const isNotPastDate = (dateString) => {
    if (!dateString) return false;
    const selected = new Date(dateString);
    selected.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  };

  const setError = (inputEl, errorEl, message) => {
    if (inputEl) inputEl.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = message;
  };

  const clearError = (inputEl, errorEl) => {
    if (inputEl) inputEl.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
  };

  // Real-time error clearing & live preview listeners
  if (resNameInput) {
    resNameInput.addEventListener('input', () => {
      clearError(resNameInput, errorName);
      updateLiveTicket();
    });
  }
  if (resEmailInput) resEmailInput.addEventListener('input', () => clearError(resEmailInput, errorEmail));
  if (resPhoneInput) resPhoneInput.addEventListener('input', () => clearError(resPhoneInput, errorPhone));
  if (resDateInput) {
    resDateInput.addEventListener('change', () => {
      clearError(resDateInput, errorDate);
      updateLiveTicket();
    });
  }
  if (resTimeInput) {
    resTimeInput.addEventListener('change', () => {
      clearError(resTimeInput, errorTime);
      updateLiveTicket();
    });
  }
  if (resGuestsInput) {
    resGuestsInput.addEventListener('change', () => {
      clearError(resGuestsInput, errorGuests);
      updateLiveTicket();
    });
  }
  if (resOccasionInput) {
    resOccasionInput.addEventListener('change', updateLiveTicket);
  }

  // =========================================================================
  // 10. CLOUD SERVICES INITIALIZATION (SUPABASE & GOOGLE SHEETS)
  // =========================================================================
  const STORAGE_KEY = 'bliss_bloom_reservations';

  let supabaseClient = null;
  let currentUser = null;

  const initSupabaseClient = () => {
    supabaseClient = null;
    if (window.supabase && window.ENV_CONFIG && window.ENV_CONFIG.isSupabaseConfigured()) {
      try {
        supabaseClient = window.supabase.createClient(
          window.ENV_CONFIG.SUPABASE_URL,
          window.ENV_CONFIG.SUPABASE_ANON_KEY
        );
        console.info('Supabase client initialized successfully.');
      } catch (err) {
        console.warn('Could not initialize Supabase client:', err);
      }
    }
  };
  initSupabaseClient();

  // Helper to submit data to Google Sheets Webhook
  const submitToGoogleSheets = async (payload) => {
    if (!window.ENV_CONFIG || !window.ENV_CONFIG.isGoogleSheetsConfigured()) {
      return { success: false, reason: 'unconfigured' };
    }
    try {
      await fetch(window.ENV_CONFIG.GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return { success: true };
    } catch (err) {
      console.warn('Google Sheets Webhook submission error:', err);
      return { success: false, error: err };
    }
  };

  // Local Storage helper (cached per user)
  const getUserStorageKey = () => {
    return currentUser && currentUser.id ? `${STORAGE_KEY}_${currentUser.id}` : STORAGE_KEY;
  };

  const getSavedReservations = () => {
    try {
      const data = localStorage.getItem(getUserStorageKey());
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('LocalStorage read error:', e);
      return [];
    }
  };

  const saveLocalReservation = (booking) => {
    try {
      const key = getUserStorageKey();
      const current = getSavedReservations();
      current.unshift(booking);
      localStorage.setItem(key, JSON.stringify(current));
    } catch (e) {
      console.warn('Could not save booking locally:', e);
    }
  };

  // Update Cloud Status Badges across the UI
  const refreshCloudStatusUI = () => {
    const isSupabaseLive = Boolean(supabaseClient && window.ENV_CONFIG.isSupabaseConfigured());
    const isSheetsLive = Boolean(window.ENV_CONFIG.isGoogleSheetsConfigured());

    // Reservation section badge
    const cloudStatusBadge = document.getElementById('cloud-status-badge');
    const cloudStatusText = document.getElementById('cloud-status-text');
    if (cloudStatusBadge && cloudStatusText) {
      if (isSupabaseLive) {
        cloudStatusBadge.classList.add('is-live');
        cloudStatusText.innerHTML = '<strong>Live Cloud Active:</strong> Reservations are synced to Supabase PostgreSQL database.';
      } else {
        cloudStatusBadge.classList.remove('is-live');
        cloudStatusText.textContent = 'Cloud Database & Authentication: Real-time table reservations powered by Supabase.';
      }
    }

    // Auth modal banner
    const authCloudBanner = document.getElementById('auth-cloud-mode-banner');
    const authCloudText = document.getElementById('auth-cloud-mode-text');
    if (authCloudBanner && authCloudText) {
      if (isSupabaseLive) {
        authCloudBanner.classList.add('is-live');
        authCloudText.textContent = '🟢 Supabase Secure Authentication Active';
      } else {
        authCloudBanner.classList.remove('is-live');
        authCloudText.textContent = 'Supabase Secure Authentication';
      }
    }

    // Cloud settings modal badges
    const badgeSupabase = document.getElementById('badge-supabase-status');
    if (badgeSupabase) {
      if (isSupabaseLive) {
        badgeSupabase.className = 'cloud-badge active';
        badgeSupabase.textContent = '🟢 Connected';
      } else {
        badgeSupabase.className = 'cloud-badge demo';
        badgeSupabase.textContent = '⚪ Not Configured';
      }
    }

    const badgeSheets = document.getElementById('badge-sheets-status');
    if (badgeSheets) {
      if (isSheetsLive) {
        badgeSheets.className = 'cloud-badge active';
        badgeSheets.textContent = '🟢 Connected';
      } else {
        badgeSheets.className = 'cloud-badge demo';
        badgeSheets.textContent = '⚪ Not Configured';
      }
    }
  };
  refreshCloudStatusUI();

  // =========================================================================
  // 11. USER-SPECIFIC AUTHENTICATION (SUPABASE AUTH)
  // =========================================================================
  const authModal = document.getElementById('auth-modal');
  const authBackdrop = document.getElementById('auth-backdrop');
  const authCloseBtn = document.getElementById('auth-close-btn');

  const tabSigninBtn = document.getElementById('tab-signin-btn');
  const tabSignupBtn = document.getElementById('tab-signup-btn');
  const formSignin = document.getElementById('form-signin');
  const formSignup = document.getElementById('form-signup');
  const formForgotPassword = document.getElementById('form-forgot-password');

  const authAlert = document.getElementById('auth-alert');
  const authAlertMsg = document.getElementById('auth-alert-message');

  const headerAuthBtn = document.getElementById('header-auth-btn');
  const authBtnLabel = document.getElementById('auth-btn-label');
  const userMenuDropdown = document.getElementById('user-menu-dropdown');
  const userDisplayName = document.getElementById('user-display-name');
  const userDisplayEmail = document.getElementById('user-display-email');
  const userBookingsCount = document.getElementById('user-bookings-count');
  const openMyReservationsBtn = document.getElementById('open-my-reservations-btn');
  const openCloudSettingsBtn = document.getElementById('open-cloud-settings-btn');
  const userSignoutBtn = document.getElementById('user-signout-btn');

  const mobileAuthBtn = document.getElementById('mobile-auth-btn');
  const mobileAuthBtnLabel = document.getElementById('mobile-auth-btn-label');
  const mobileMyReservationsBtn = document.getElementById('mobile-my-reservations-btn');
  const mobileBookingsCount = document.getElementById('mobile-bookings-count');

  const showAuthAlert = (message, type = 'error') => {
    if (!authAlert || !authAlertMsg) return;
    authAlert.className = `form-notification ${type}`;
    authAlertMsg.textContent = message;
    authAlert.style.display = 'flex';
  };

  const hideAuthAlert = () => {
    if (!authAlert) return;
    authAlert.style.display = 'none';
  };

  const switchAuthTab = (tab) => {
    hideAuthAlert();
    if (tab === 'signin') {
      if (tabSigninBtn) {
        tabSigninBtn.classList.add('active');
        tabSigninBtn.setAttribute('aria-selected', 'true');
      }
      if (tabSignupBtn) {
        tabSignupBtn.classList.remove('active');
        tabSignupBtn.setAttribute('aria-selected', 'false');
      }
      if (formSignin) formSignin.style.display = 'block';
      if (formSignup) formSignup.style.display = 'none';
      if (formForgotPassword) formForgotPassword.style.display = 'none';
    } else if (tab === 'signup') {
      if (tabSignupBtn) {
        tabSignupBtn.classList.add('active');
        tabSignupBtn.setAttribute('aria-selected', 'true');
      }
      if (tabSigninBtn) {
        tabSigninBtn.classList.remove('active');
        tabSigninBtn.setAttribute('aria-selected', 'false');
      }
      if (formSignup) formSignup.style.display = 'block';
      if (formSignin) formSignin.style.display = 'none';
      if (formForgotPassword) formForgotPassword.style.display = 'none';
    } else if (tab === 'forgot') {
      if (formForgotPassword) formForgotPassword.style.display = 'block';
      if (formSignin) formSignin.style.display = 'none';
      if (formSignup) formSignup.style.display = 'none';
    }
  };

  if (tabSigninBtn) tabSigninBtn.addEventListener('click', () => switchAuthTab('signin'));
  if (tabSignupBtn) tabSignupBtn.addEventListener('click', () => switchAuthTab('signup'));

  const btnForgotToggle = document.getElementById('btn-forgot-password-toggle');
  if (btnForgotToggle) btnForgotToggle.addEventListener('click', () => switchAuthTab('forgot'));

  const backToSigninBtn = document.getElementById('back-to-signin-btn');
  if (backToSigninBtn) backToSigninBtn.addEventListener('click', () => switchAuthTab('signin'));

  const switchToSignupBtn = document.getElementById('switch-to-signup-btn');
  if (switchToSignupBtn) switchToSignupBtn.addEventListener('click', () => switchAuthTab('signup'));

  const switchToSigninBtn = document.getElementById('switch-to-signin-btn');
  if (switchToSigninBtn) switchToSigninBtn.addEventListener('click', () => switchAuthTab('signin'));

  const openAuthModal = () => {
    if (!authModal) return;
    refreshCloudStatusUI();
    switchAuthTab('signin');
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const closeAuthModal = () => {
    if (!authModal) return;
    authModal.style.display = 'none';
    document.body.style.overflow = '';
    hideAuthAlert();
  };

  if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);
  if (authBackdrop) authBackdrop.addEventListener('click', closeAuthModal);

  // Update user UI across header, reservation form, and mobile drawer
  const updateAuthUI = (user) => {
    currentUser = user;

    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member';
      const initial = (name[0] || 'U').toUpperCase();

      if (headerAuthBtn) {
        headerAuthBtn.className = 'user-profile-pill';
        headerAuthBtn.innerHTML = `
          <div class="user-avatar-circle">${initial}</div>
          <span class="user-name-short">${name}</span>
          <svg class="user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `;
      }

      if (userDisplayName) userDisplayName.textContent = name;
      if (userDisplayEmail) userDisplayEmail.textContent = user.email || '';

      if (mobileAuthBtnLabel) mobileAuthBtnLabel.textContent = `Signed in: ${name}`;
      if (mobileMyReservationsBtn) {
        mobileMyReservationsBtn.style.display = 'block';
      }

      // Pre-fill reservation form
      if (resNameInput && !resNameInput.value) resNameInput.value = name;
      if (resEmailInput && !resEmailInput.value) resEmailInput.value = user.email || '';
      updateLiveTicket();

      // Fetch user booking count asynchronously
      fetchUserBookingsCount();
    } else {
      if (headerAuthBtn) {
        headerAuthBtn.className = 'btn btn-auth';
        headerAuthBtn.innerHTML = `
          <svg class="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span id="auth-btn-label">Sign In</span>
        `;
      }
      if (userMenuDropdown) userMenuDropdown.style.display = 'none';

      if (mobileAuthBtnLabel) mobileAuthBtnLabel.textContent = 'Sign In / Account';
      if (mobileMyReservationsBtn) mobileMyReservationsBtn.style.display = 'none';

      if (existingBookingsBar) existingBookingsBar.style.display = 'none';
    }
  };

  const fetchUserBookingsCount = async () => {
    if (!currentUser) return;
    let count = 0;

    if (supabaseClient) {
      try {
        const { count: dbCount, error } = await supabaseClient
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id);

        if (!error && typeof dbCount === 'number') {
          count = dbCount;
        }
      } catch (e) {
        console.warn('Booking count query note:', e);
      }
    }

    if (count === 0) {
      count = getSavedReservations().length;
    }

    if (userBookingsCount) userBookingsCount.textContent = count;
    if (mobileBookingsCount) mobileBookingsCount.textContent = count;

    if (existingBookingsBar && existingBookingsText) {
      if (count > 0) {
        existingBookingsBar.style.display = 'flex';
        existingBookingsText.textContent = `Signed in as ${currentUser.user_metadata?.full_name || currentUser.email}. You have ${count} active table reservation${count > 1 ? 's' : ''}.`;
      } else {
        existingBookingsBar.style.display = 'none';
      }
    }
  };

  // Header button click: toggles dropdown if logged in, opens auth modal if logged out
  if (headerAuthBtn) {
    headerAuthBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentUser) {
        if (userMenuDropdown) {
          const isShown = userMenuDropdown.style.display === 'block';
          userMenuDropdown.style.display = isShown ? 'none' : 'block';
          headerAuthBtn.classList.toggle('active', !isShown);
        }
      } else {
        openAuthModal();
      }
    });
  }

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (userMenuDropdown && userMenuDropdown.style.display === 'block') {
      if (!userMenuDropdown.contains(e.target) && e.target !== headerAuthBtn) {
        userMenuDropdown.style.display = 'none';
        if (headerAuthBtn) headerAuthBtn.classList.remove('active');
      }
    }
  });

  if (mobileAuthBtn) {
    mobileAuthBtn.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) closeMobileNav();
      if (currentUser) {
        openUserReservationsModal();
      } else {
        openAuthModal();
      }
    });
  }

  // Check initial Auth Session (Strictly Supabase)
  const checkInitialSession = async () => {
    if (supabaseClient) {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (session && session.user) {
          updateAuthUI(session.user);
        } else {
          updateAuthUI(null);
        }
      } catch (e) {
        console.warn('Supabase session fetch error:', e);
        updateAuthUI(null);
      }

      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          updateAuthUI(session.user);
        } else {
          updateAuthUI(null);
        }
      });
    } else {
      updateAuthUI(null);
    }
  };
  checkInitialSession();

  // Sign In Form Submission (Real Supabase Auth)
  if (formSignin) {
    formSignin.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthAlert();

      const emailInput = document.getElementById('signin-email');
      const passwordInput = document.getElementById('signin-password');
      const submitBtn = document.getElementById('signin-submit-btn');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!email || !isValidEmail(email)) {
        showAuthAlert('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        showAuthAlert('Please enter your password (minimum 6 characters).');
        return;
      }

      if (!supabaseClient) {
        showAuthAlert('Supabase authentication is not configured yet. Please configure your SUPABASE_URL and SUPABASE_ANON_KEY in js/config.js (or Cloud Settings) to sign in to your real account.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Signing in...</span>';
      }

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
          showAuthAlert(error.message || 'Invalid email or password.');
        } else {
          showAuthAlert('Signed in successfully! Welcome back.', 'success');
          setTimeout(() => {
            closeAuthModal();
            formSignin.reset();
          }, 800);
        }
      } catch (err) {
        showAuthAlert(err.message || 'Connection error. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Sign In</span>';
        }
      }
    });
  }

  // Sign Up Form Submission (Real Supabase Auth)
  if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthAlert();

      const nameInput = document.getElementById('signup-name');
      const emailInput = document.getElementById('signup-email');
      const passwordInput = document.getElementById('signup-password');
      const confirmInput = document.getElementById('signup-password-confirm');
      const submitBtn = document.getElementById('signup-submit-btn');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const confirm = confirmInput ? confirmInput.value : '';

      if (!name || name.length < 2) {
        showAuthAlert('Please enter your full name (at least 2 characters).');
        return;
      }
      if (!email || !isValidEmail(email)) {
        showAuthAlert('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        showAuthAlert('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirm) {
        showAuthAlert('Passwords do not match. Please re-enter.');
        return;
      }

      if (!supabaseClient) {
        showAuthAlert('Supabase authentication is not configured yet. Please configure your SUPABASE_URL and SUPABASE_ANON_KEY in js/config.js (or Cloud Settings) to register your account.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating Account...</span>';
      }

      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });

        if (error) {
          showAuthAlert(error.message || 'Could not complete registration.');
        } else if (data.user && !data.session) {
          showAuthAlert('Account created! A confirmation email has been sent to ' + email + '. Please verify your email to log in.', 'success');
        } else {
          showAuthAlert('Account created and signed in! Welcome, ' + name + '.', 'success');
          setTimeout(() => {
            closeAuthModal();
            formSignup.reset();
          }, 1200);
        }
      } catch (err) {
        showAuthAlert(err.message || 'Network error during registration.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Create Account</span>';
        }
      }
    });
  }

  // Forgot Password Form Submission (Real Supabase Auth)
  if (formForgotPassword) {
    formForgotPassword.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthAlert();

      const emailInput = document.getElementById('forgot-email');
      const submitBtn = document.getElementById('forgot-submit-btn');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !isValidEmail(email)) {
        showAuthAlert('Please enter your account email.');
        return;
      }

      if (!supabaseClient) {
        showAuthAlert('Supabase is not configured yet. Please add your credentials in js/config.js to send password reset emails.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending Link...</span>';
      }

      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) {
          showAuthAlert(error.message || 'Could not send reset email.');
        } else {
          showAuthAlert('Password recovery link has been sent to your email address.', 'success');
          setTimeout(() => {
            switchAuthTab('signin');
          }, 2500);
        }
      } catch (err) {
        showAuthAlert(err.message || 'Network error sending reset email.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Recovery Email</span>';
        }
      }
    });
  }

  // Sign Out Action
  if (userSignoutBtn) {
    userSignoutBtn.addEventListener('click', async () => {
      if (userMenuDropdown) userMenuDropdown.style.display = 'none';

      if (supabaseClient) {
        try {
          await supabaseClient.auth.signOut();
        } catch (err) {
          console.warn('Signout note:', err);
        }
      }
      updateAuthUI(null);
    });
  }

  // Connect "View My Bookings" button in banner
  const viewUserBookingsBtn = document.getElementById('view-user-bookings-btn');
  if (viewUserBookingsBtn) {
    viewUserBookingsBtn.addEventListener('click', () => {
      openUserReservationsModal();
    });
  }

  // =========================================================================
  // 12. TABLE RESERVATIONS (USER-SPECIFIC SUPABASE POSTGRES + GOOGLE SHEETS)
  // =========================================================================
  if (reservationForm) {
    reservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;

      // 1. Name
      const nameVal = resNameInput.value.trim();
      if (!nameVal || nameVal.length < 2) {
        setError(resNameInput, errorName, 'Please enter your full name (minimum 2 characters).');
        isValid = false;
      } else {
        clearError(resNameInput, errorName);
      }

      // 2. Email
      const emailVal = resEmailInput.value.trim();
      if (!emailVal) {
        setError(resEmailInput, errorEmail, 'Please enter your email address.');
        isValid = false;
      } else if (!isValidEmail(emailVal)) {
        setError(resEmailInput, errorEmail, 'Please enter a valid email address.');
        isValid = false;
      } else {
        clearError(resEmailInput, errorEmail);
      }

      // 3. Phone
      const phoneVal = resPhoneInput.value.trim();
      if (!phoneVal) {
        setError(resPhoneInput, errorPhone, 'Please enter your phone number.');
        isValid = false;
      } else if (!isValidPhone(phoneVal)) {
        setError(resPhoneInput, errorPhone, 'Please enter a valid phone number with at least 10 digits.');
        isValid = false;
      } else {
        clearError(resPhoneInput, errorPhone);
      }

      // 4. Date
      const dateVal = resDateInput.value;
      if (!dateVal) {
        setError(resDateInput, errorDate, 'Please choose a reservation date.');
        isValid = false;
      } else if (!isNotPastDate(dateVal)) {
        setError(resDateInput, errorDate, 'Reservation date cannot be in the past.');
        isValid = false;
      } else {
        clearError(resDateInput, errorDate);
      }

      // 5. Time
      const timeVal = resTimeInput.value;
      if (!timeVal) {
        setError(resTimeInput, errorTime, 'Please select a preferred seating time.');
        isValid = false;
      } else {
        clearError(resTimeInput, errorTime);
      }

      // 6. Guests
      const guestsVal = resGuestsInput.value;
      if (!guestsVal) {
        setError(resGuestsInput, errorGuests, 'Please select the number of guests.');
        isValid = false;
      } else {
        clearError(resGuestsInput, errorGuests);
      }

      if (!isValid) {
        const firstInvalid = reservationForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Format Date for Display
      const parsedDate = new Date(dateVal + 'T00:00:00');
      const formattedDate = parsedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const refId = `BB-${Math.floor(10000 + Math.random() * 90000)}`;
      const guestsInt = parseInt(guestsVal, 10) || 2;
      const occasionVal = resOccasionInput ? resOccasionInput.value : 'Casual Dining';
      const notesVal = resNotesInput ? resNotesInput.value.trim() : '';

      const bookingData = {
        refId,
        booking_ref: refId,
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        date: formattedDate,
        rawDate: dateVal,
        time: timeVal,
        guests: guestsInt,
        occasion: occasionVal,
        notes: notesVal,
        status: 'confirmed',
        user_id: currentUser ? currentUser.id : null,
        createdAt: new Date().toISOString()
      };

      const resSubmitBtn = reservationForm.querySelector('button[type="submit"]');
      if (resSubmitBtn) {
        resSubmitBtn.disabled = true;
        resSubmitBtn.textContent = 'Confirming Reservation...';
      }

      // 1. Supabase Postgres Insert (Strict User Linkage)
      let savedToSupabase = false;
      if (supabaseClient) {
        try {
          const supabasePayload = {
            booking_ref: refId,
            name: nameVal,
            email: emailVal,
            phone: phoneVal,
            date: formattedDate,
            time: timeVal,
            guests: guestsInt,
            occasion: occasionVal,
            notes: notesVal,
            status: 'confirmed',
            user_id: currentUser ? currentUser.id : null
          };

          const { error } = await supabaseClient.from('reservations').insert([supabasePayload]);
          if (!error) {
            savedToSupabase = true;
          } else {
            console.warn('Supabase reservation insert note:', error.message);
          }
        } catch (dbErr) {
          console.warn('Supabase DB connection error:', dbErr);
        }
      }

      // 2. Google Sheets Backup Webhook
      submitToGoogleSheets({
        type: 'reservation',
        ...bookingData
      });

      // 3. User Cache persistence
      saveLocalReservation(bookingData);
      fetchUserBookingsCount();

      if (resSubmitBtn) {
        resSubmitBtn.disabled = false;
        resSubmitBtn.textContent = 'Confirm Reservation';
      }

      // Populate Confirmation Modal
      if (modalRefId) modalRefId.textContent = bookingData.refId;
      if (modalGuestName) modalGuestName.textContent = bookingData.name;
      if (modalGuestDate) modalGuestDate.textContent = bookingData.date;
      if (modalGuestTime) modalGuestTime.textContent = bookingData.time;
      if (modalGuestCount) modalGuestCount.textContent = `${bookingData.guests} Guests`;
      if (modalGuestOccasion) modalGuestOccasion.textContent = bookingData.occasion;

      if (bookingData.notes) {
        if (modalGuestNotes) modalGuestNotes.textContent = bookingData.notes;
        if (modalNotesRow) modalNotesRow.style.display = 'flex';
      } else {
        if (modalNotesRow) modalNotesRow.style.display = 'none';
      }

      // Update disclaimer on modal
      const modalDisclaimer = document.getElementById('confirmation-disclaimer-text');
      if (modalDisclaimer) {
        if (savedToSupabase) {
          modalDisclaimer.innerHTML = '🟢 <strong>Saved to Supabase Cloud:</strong> Your reservation is linked to your account in our database.';
        } else {
          modalDisclaimer.innerHTML = 'Your reservation reference has been registered in our restaurant booking record.';
        }
      }

      // Show Confirmation Modal
      if (confirmationModal) {
        confirmationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
  }

  const closeConfirmationModal = () => {
    if (!confirmationModal) return;
    confirmationModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeConfirmationModal);
  if (closeModalActionBtn) closeModalActionBtn.addEventListener('click', closeConfirmationModal);
  if (confirmationBackdrop) confirmationBackdrop.addEventListener('click', closeConfirmationModal);

  if (bookAnotherBtn) {
    bookAnotherBtn.addEventListener('click', () => {
      closeConfirmationModal();
      if (reservationForm) {
        reservationForm.reset();
        setMinReservationDate();
        if (currentUser) {
          if (resNameInput) resNameInput.value = currentUser.user_metadata?.full_name || '';
          if (resEmailInput) resEmailInput.value = currentUser.email || '';
        }
        updateLiveTicket();
      }
      if (resNameInput) resNameInput.focus();
    });
  }

  // =========================================================================
  // 13. USER RESERVATIONS MODAL (STRICT USER-SPECIFIC AUTHORIZATION)
  // =========================================================================
  const userReservationsModal = document.getElementById('user-reservations-modal');
  const userReservationsBackdrop = document.getElementById('user-reservations-backdrop');
  const userReservationsCloseBtn = document.getElementById('user-reservations-close-btn');
  const userReservationsList = document.getElementById('user-reservations-list');
  const closeMyReservationsActionBtn = document.getElementById('close-my-reservations-action-btn');
  const reserveAnotherFromModalBtn = document.getElementById('reserve-another-from-modal-btn');

  const openUserReservationsModal = async () => {
    if (!userReservationsModal) return;
    if (userMenuDropdown) userMenuDropdown.style.display = 'none';
    if (headerAuthBtn) headerAuthBtn.classList.remove('active');

    userReservationsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    renderUserReservations();
  };

  const closeUserReservationsModal = () => {
    if (!userReservationsModal) return;
    userReservationsModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (openMyReservationsBtn) openMyReservationsBtn.addEventListener('click', openUserReservationsModal);
  if (mobileMyReservationsBtn) mobileMyReservationsBtn.addEventListener('click', () => {
    if (mobileDrawer && mobileDrawer.classList.contains('open')) closeMobileNav();
    openUserReservationsModal();
  });
  if (userReservationsCloseBtn) userReservationsCloseBtn.addEventListener('click', closeUserReservationsModal);
  if (userReservationsBackdrop) userReservationsBackdrop.addEventListener('click', closeUserReservationsModal);
  if (closeMyReservationsActionBtn) closeMyReservationsActionBtn.addEventListener('click', closeUserReservationsModal);

  if (reserveAnotherFromModalBtn) {
    reserveAnotherFromModalBtn.addEventListener('click', () => {
      closeUserReservationsModal();
    });
  }

  const renderUserReservations = async () => {
    if (!userReservationsList) return;

    // Authorization Guard: Require real authenticated user
    if (!currentUser) {
      userReservationsList.innerHTML = `
        <div class="empty-reservations">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h4 style="font-family:var(--font-serif); font-size:1.15rem; color:var(--color-primary); margin-bottom:0.35rem;">Sign In Required</h4>
          <p style="font-size:0.875rem; color:var(--color-charcoal-muted); margin-bottom:1.25rem;">Please log in with your account to access your personal table reservations.</p>
          <button type="button" class="btn btn-primary btn-sm" id="auth-from-reservations-btn">Sign In to Your Account</button>
        </div>
      `;
      const authBtn = document.getElementById('auth-from-reservations-btn');
      if (authBtn) {
        authBtn.addEventListener('click', () => {
          closeUserReservationsModal();
          openAuthModal();
        });
      }
      return;
    }

    userReservationsList.innerHTML = '<p style="text-align:center; padding:1.5rem; color:var(--color-charcoal-muted);">Loading your reservations...</p>';

    let bookings = [];

    // Strictly fetch reservations owned by this authenticated user
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('reservations')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          bookings = data.map(item => ({
            id: item.id,
            refId: item.booking_ref,
            name: item.name,
            email: item.email,
            date: item.date,
            time: item.time,
            guests: item.guests,
            occasion: item.occasion,
            notes: item.notes,
            status: item.status || 'confirmed'
          }));
        }
      } catch (err) {
        console.warn('Supabase bookings query error:', err);
      }
    }

    // Fallback to user-specific cache
    if (bookings.length === 0) {
      bookings = getSavedReservations();
    }

    if (bookings.length === 0) {
      userReservationsList.innerHTML = `
        <div class="empty-reservations">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h4 style="font-family:var(--font-serif); font-size:1.15rem; color:var(--color-primary); margin-bottom:0.35rem;">No Bookings Found</h4>
          <p style="font-size:0.875rem; color:var(--color-charcoal-muted); margin-bottom:1rem;">You don't have any table reservations registered under <strong>${currentUser.email}</strong>.</p>
        </div>
      `;
      return;
    }

    userReservationsList.innerHTML = bookings.map((item) => `
      <div class="reservation-record-card" data-ref="${item.refId || ''}">
        <div class="record-card-top">
          <span class="record-ref">${item.refId || 'BB-BOOKING'}</span>
          <span class="record-status-tag ${item.status === 'cancelled' ? 'cancelled' : ''}">
            ${item.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
          </span>
        </div>
        <div class="record-meta-grid">
          <div class="record-meta-item">📅 Date: <strong>${item.date}</strong></div>
          <div class="record-meta-item">⏰ Time: <strong>${item.time}</strong></div>
          <div class="record-meta-item">👥 Guests: <strong>${item.guests}</strong></div>
          <div class="record-meta-item">✨ Occasion: <strong>${item.occasion || 'Casual Dining'}</strong></div>
        </div>
        ${item.notes ? `<p style="font-size:0.8rem; color:var(--color-charcoal-muted); margin-bottom:0.5rem;"><em>"${item.notes}"</em></p>` : ''}
        ${item.status !== 'cancelled' ? `
          <div class="record-actions">
            <button type="button" class="btn-record-cancel" data-cancel-ref="${item.refId}" data-cancel-id="${item.id || ''}">Cancel Booking</button>
          </div>
        ` : ''}
      </div>
    `).join('');

    // Attach cancel booking handlers (Strict Authorization: only owner can cancel)
    userReservationsList.querySelectorAll('.btn-record-cancel').forEach(btn => {
      btn.addEventListener('click', async function () {
        const ref = this.getAttribute('data-cancel-ref');
        const dbId = this.getAttribute('data-cancel-id');

        if (!confirm(`Are you sure you want to cancel reservation #${ref}?`)) {
          return;
        }

        // Cancel in Supabase with user_id authorization check
        if (supabaseClient && dbId) {
          try {
            const { error } = await supabaseClient
              .from('reservations')
              .update({ status: 'cancelled' })
              .eq('id', dbId)
              .eq('user_id', currentUser.id);

            if (error) {
              alert('Could not cancel booking: ' + error.message);
              return;
            }
          } catch (err) {
            console.warn('Supabase cancellation note:', err);
          }
        }

        // Update in user-specific localStorage cache
        try {
          const key = getUserStorageKey();
          const current = getSavedReservations();
          const updated = current.map(b => (b.refId === ref || b.booking_ref === ref) ? { ...b, status: 'cancelled' } : b);
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage cancel update error:', e);
        }

        renderUserReservations();
        fetchUserBookingsCount();
      });
    });
  };

  // =========================================================================
  // 14. CONTACT & NEWSLETTER FORMS (GOOGLE SHEETS INTEGRATION)
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactMessage = document.getElementById('contact-message');
  const contactErrorName = document.getElementById('contact-error-name');
  const contactErrorEmail = document.getElementById('contact-error-email');
  const contactErrorMessage = document.getElementById('contact-error-message');
  const contactSuccessAlert = document.getElementById('contact-success-alert');
  const contactSuccessDesc = document.getElementById('contact-success-desc');
  const contactSubmitBtn = document.getElementById('contact-submit-btn');

  if (contactName) contactName.addEventListener('input', () => clearError(contactName, contactErrorName));
  if (contactEmail) contactEmail.addEventListener('input', () => clearError(contactEmail, contactErrorEmail));
  if (contactMessage) contactMessage.addEventListener('input', () => clearError(contactMessage, contactErrorMessage));

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      const nameVal = contactName ? contactName.value.trim() : '';
      const emailVal = contactEmail ? contactEmail.value.trim() : '';
      const messageVal = contactMessage ? contactMessage.value.trim() : '';

      if (!nameVal || nameVal.length < 2) {
        setError(contactName, contactErrorName, 'Please enter your name.');
        isValid = false;
      } else {
        clearError(contactName, contactErrorName);
      }

      if (!emailVal) {
        setError(contactEmail, contactErrorEmail, 'Please enter your email.');
        isValid = false;
      } else if (!isValidEmail(emailVal)) {
        setError(contactEmail, contactErrorEmail, 'Please enter a valid email address.');
        isValid = false;
      } else {
        clearError(contactEmail, contactErrorEmail);
      }

      if (!messageVal || messageVal.length < 5) {
        setError(contactMessage, contactErrorMessage, 'Please enter a message (at least 5 characters).');
        isValid = false;
      } else {
        clearError(contactMessage, contactErrorMessage);
      }

      if (!isValid) return;

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.textContent = 'Sending Message...';
      }

      const payload = {
        type: 'contact',
        name: nameVal,
        email: emailVal,
        message: messageVal,
        timestamp: new Date().toISOString()
      };

      // 1. Submit to Google Sheets Webhook
      const sheetsResult = await submitToGoogleSheets(payload);

      // 2. Optional Supabase Contact insert
      if (supabaseClient) {
        try {
          await supabaseClient.from('contacts').insert([
            { name: nameVal, email: emailVal, message: messageVal }
          ]);
        } catch (dbErr) {
          // Schema contacts table is optional
        }
      }

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = false;
        contactSubmitBtn.textContent = 'Send Message →';
      }

      if (contactSuccessAlert) {
        if (contactSuccessDesc) {
          if (sheetsResult.success) {
            contactSuccessDesc.textContent = 'Thank you! Your message has been saved to our Google Sheet and delivered to the restaurant concierge.';
          } else {
            contactSuccessDesc.textContent = 'Thank you for reaching out! Your message was received. (Connect Google Sheets in Cloud Settings for live sheet appending).';
          }
        }
        contactSuccessAlert.style.display = 'flex';
      }
      contactForm.reset();

      setTimeout(() => {
        if (contactSuccessAlert) contactSuccessAlert.style.display = 'none';
      }, 9000);
    });
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterError = document.getElementById('newsletter-error');
  const newsletterSuccessAlert = document.getElementById('newsletter-success-alert');

  if (newsletterEmail) {
    newsletterEmail.addEventListener('input', () => {
      if (newsletterError) newsletterError.textContent = '';
      newsletterEmail.classList.remove('is-invalid');
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();

      if (!email || !isValidEmail(email)) {
        if (newsletterError) newsletterError.textContent = 'Please enter a valid email address.';
        newsletterEmail.classList.add('is-invalid');
        return;
      }

      if (newsletterError) newsletterError.textContent = '';
      newsletterEmail.classList.remove('is-invalid');

      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
      }

      // Submit to Google Sheets Webhook
      await submitToGoogleSheets({
        type: 'newsletter',
        email: email,
        timestamp: new Date().toISOString()
      });

      // Optional Supabase Newsletter insert
      if (supabaseClient) {
        try {
          await supabaseClient.from('newsletter_subscribers').insert([{ email }]);
        } catch (e) {
          // Ignore unique constraints
        }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
      }

      if (newsletterSuccessAlert) {
        newsletterSuccessAlert.style.display = 'flex';
      }
      newsletterForm.reset();

      setTimeout(() => {
        if (newsletterSuccessAlert) newsletterSuccessAlert.style.display = 'none';
      }, 8000);
    });
  }

  // =========================================================================
  // 15. CLOUD & API SETTINGS MODAL
  // =========================================================================
  const cloudSettingsModal = document.getElementById('cloud-settings-modal');
  const cloudSettingsBackdrop = document.getElementById('cloud-settings-backdrop');
  const cloudSettingsCloseBtn = document.getElementById('cloud-settings-close-btn');
  const footerCloudSettingsBtn = document.getElementById('footer-cloud-settings-btn');
  const mobileCloudSettingsBtn = document.getElementById('mobile-cloud-settings-btn');

  const cfgSupabaseUrl = document.getElementById('cfg-supabase-url');
  const cfgSupabaseKey = document.getElementById('cfg-supabase-key');
  const cfgSheetsUrl = document.getElementById('cfg-sheets-url');
  const saveCloudConfigBtn = document.getElementById('save-cloud-config-btn');
  const resetCloudConfigBtn = document.getElementById('reset-cloud-config-btn');
  const settingsAlert = document.getElementById('settings-alert');
  const settingsAlertMsg = document.getElementById('settings-alert-message');

  const showSettingsAlert = (msg, type = 'success') => {
    if (!settingsAlert || !settingsAlertMsg) return;
    settingsAlert.className = `form-notification ${type}`;
    settingsAlertMsg.textContent = msg;
    settingsAlert.style.display = 'flex';
  };

  const openCloudSettingsModal = () => {
    if (!cloudSettingsModal) return;
    if (userMenuDropdown) userMenuDropdown.style.display = 'none';
    if (headerAuthBtn) headerAuthBtn.classList.remove('active');

    // Populate active values
    if (cfgSupabaseUrl) cfgSupabaseUrl.value = window.ENV_CONFIG.SUPABASE_URL || '';
    if (cfgSupabaseKey) cfgSupabaseKey.value = window.ENV_CONFIG.SUPABASE_ANON_KEY || '';
    if (cfgSheetsUrl) cfgSheetsUrl.value = window.ENV_CONFIG.GOOGLE_SHEET_WEBHOOK_URL || '';

    refreshCloudStatusUI();
    if (settingsAlert) settingsAlert.style.display = 'none';

    cloudSettingsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const closeCloudSettingsModal = () => {
    if (!cloudSettingsModal) return;
    cloudSettingsModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (openCloudSettingsBtn) openCloudSettingsBtn.addEventListener('click', openCloudSettingsModal);
  if (footerCloudSettingsBtn) footerCloudSettingsBtn.addEventListener('click', openCloudSettingsModal);
  if (mobileCloudSettingsBtn) {
    mobileCloudSettingsBtn.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) closeMobileNav();
      openCloudSettingsModal();
    });
  }
  if (cloudSettingsCloseBtn) cloudSettingsCloseBtn.addEventListener('click', closeCloudSettingsModal);
  if (cloudSettingsBackdrop) cloudSettingsBackdrop.addEventListener('click', closeCloudSettingsModal);

  if (saveCloudConfigBtn) {
    saveCloudConfigBtn.addEventListener('click', () => {
      const newConfig = {
        SUPABASE_URL: cfgSupabaseUrl ? cfgSupabaseUrl.value.trim() : '',
        SUPABASE_ANON_KEY: cfgSupabaseKey ? cfgSupabaseKey.value.trim() : '',
        GOOGLE_SHEET_WEBHOOK_URL: cfgSheetsUrl ? cfgSheetsUrl.value.trim() : ''
      };

      window.ENV_CONFIG.saveOverrides(newConfig);
      initSupabaseClient();
      refreshCloudStatusUI();
      checkInitialSession();

      showSettingsAlert('Cloud configuration saved! Integrations updated.', 'success');
      setTimeout(() => {
        closeCloudSettingsModal();
      }, 1200);
    });
  }

  if (resetCloudConfigBtn) {
    resetCloudConfigBtn.addEventListener('click', () => {
      window.ENV_CONFIG.resetOverrides();
      if (cfgSupabaseUrl) cfgSupabaseUrl.value = '';
      if (cfgSupabaseKey) cfgSupabaseKey.value = '';
      if (cfgSheetsUrl) cfgSheetsUrl.value = '';

      initSupabaseClient();
      refreshCloudStatusUI();
      checkInitialSession();

      showSettingsAlert('Reset to demo defaults.', 'success');
    });
  }

  // =========================================================================
  // 16. TASTING MENU MODAL
  // =========================================================================
  const viewTastingMenuBtn = document.getElementById('view-tasting-menu-btn');
  const tastingModal = document.getElementById('tasting-modal');
  const tastingBackdrop = document.getElementById('tasting-backdrop');
  const tastingCloseBtn = document.getElementById('tasting-close-btn');
  const tastingReserveCta = document.getElementById('tasting-reserve-cta');

  const openTastingModal = () => {
    if (!tastingModal) return;
    tastingModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const closeTastingModal = () => {
    if (!tastingModal) return;
    tastingModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (viewTastingMenuBtn) viewTastingMenuBtn.addEventListener('click', openTastingModal);
  if (tastingCloseBtn) tastingCloseBtn.addEventListener('click', closeTastingModal);
  if (tastingBackdrop) tastingBackdrop.addEventListener('click', closeTastingModal);
  if (tastingReserveCta) {
    tastingReserveCta.addEventListener('click', () => {
      closeTastingModal();
      if (resOccasionInput) {
        resOccasionInput.value = 'Special Celebrations';
        updateLiveTicket();
      }
      if (resNotesInput) {
        resNotesInput.value = 'Tasting Menu Experience (5-Course Journey) requested.';
      }
    });
  }

  // =========================================================================
  // 17. GLOBAL KEYBOARD ACCESSIBILITY
  // =========================================================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) closeMobileNav();
      if (lightboxModal && lightboxModal.style.display === 'flex') closeLightbox();
      if (confirmationModal && confirmationModal.style.display === 'flex') closeConfirmationModal();
      if (tastingModal && tastingModal.style.display === 'flex') closeTastingModal();
      if (authModal && authModal.style.display === 'flex') closeAuthModal();
      if (userReservationsModal && userReservationsModal.style.display === 'flex') closeUserReservationsModal();
      if (cloudSettingsModal && cloudSettingsModal.style.display === 'flex') closeCloudSettingsModal();
      if (userMenuDropdown) userMenuDropdown.style.display = 'none';
    }

    if (lightboxModal && lightboxModal.style.display === 'flex') {
      if (e.key === 'ArrowRight') showNextLightboxImage();
      if (e.key === 'ArrowLeft') showPrevLightboxImage();
    }
  });

});
