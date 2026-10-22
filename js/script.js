/**
 * Basil & Bloom — Modern Contemporary Restaurant Website
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
        const caption = item.getAttribute('data-caption') || (imgEl ? imgEl.alt : 'Basil & Bloom');
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

  // LocalStorage Management
  const STORAGE_KEY = 'basil_bloom_demo_reservations';

  const getSavedReservations = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return [];
    }
  };

  const saveReservation = (booking) => {
    try {
      const current = getSavedReservations();
      current.unshift(booking);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Could not save booking:', e);
    }
  };

  const updateBookingsBar = () => {
    if (!existingBookingsBar || !existingBookingsText) return;
    const bookings = getSavedReservations();
    if (bookings.length > 0) {
      existingBookingsBar.style.display = 'flex';
      const lastBooking = bookings[0];
      existingBookingsText.textContent = `You have ${bookings.length} demo booking${bookings.length > 1 ? 's' : ''} saved (Latest: ${lastBooking.name} for ${lastBooking.guests} on ${lastBooking.date}).`;
    } else {
      existingBookingsBar.style.display = 'none';
    }
  };
  updateBookingsBar();

  if (clearBookingsBtn) {
    clearBookingsBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      updateBookingsBar();
    });
  }

  // Reservation Form Submission
  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
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

      const bookingData = {
        refId,
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        date: formattedDate,
        rawDate: dateVal,
        time: timeVal,
        guests: guestsVal,
        occasion: resOccasionInput ? resOccasionInput.value : 'Casual Dining',
        notes: resNotesInput ? resNotesInput.value.trim() : '',
        createdAt: new Date().toISOString()
      };

      saveReservation(bookingData);
      updateBookingsBar();

      // Populate Confirmation Modal
      if (modalRefId) modalRefId.textContent = bookingData.refId;
      if (modalGuestName) modalGuestName.textContent = bookingData.name;
      if (modalGuestDate) modalGuestDate.textContent = bookingData.date;
      if (modalGuestTime) modalGuestTime.textContent = bookingData.time;
      if (modalGuestCount) modalGuestCount.textContent = bookingData.guests;
      if (modalGuestOccasion) modalGuestOccasion.textContent = bookingData.occasion;

      if (bookingData.notes) {
        if (modalGuestNotes) modalGuestNotes.textContent = bookingData.notes;
        if (modalNotesRow) modalNotesRow.style.display = 'flex';
      } else {
        if (modalNotesRow) modalNotesRow.style.display = 'none';
      }

      // Show Modal
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
        updateLiveTicket();
      }
      if (resNameInput) resNameInput.focus();
    });
  }

  // =========================================================================
  // 11. CONTACT & NEWSLETTER FORMS
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactMessage = document.getElementById('contact-message');
  const contactErrorName = document.getElementById('contact-error-name');
  const contactErrorEmail = document.getElementById('contact-error-email');
  const contactErrorMessage = document.getElementById('contact-error-message');
  const contactSuccessAlert = document.getElementById('contact-success-alert');

  if (contactName) contactName.addEventListener('input', () => clearError(contactName, contactErrorName));
  if (contactEmail) contactEmail.addEventListener('input', () => clearError(contactEmail, contactErrorEmail));
  if (contactMessage) contactMessage.addEventListener('input', () => clearError(contactMessage, contactErrorMessage));

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      if (!contactName.value.trim() || contactName.value.trim().length < 2) {
        setError(contactName, contactErrorName, 'Please enter your name.');
        isValid = false;
      } else {
        clearError(contactName, contactErrorName);
      }

      if (!contactEmail.value.trim()) {
        setError(contactEmail, contactErrorEmail, 'Please enter your email.');
        isValid = false;
      } else if (!isValidEmail(contactEmail.value.trim())) {
        setError(contactEmail, contactErrorEmail, 'Please enter a valid email address.');
        isValid = false;
      } else {
        clearError(contactEmail, contactErrorEmail);
      }

      if (!contactMessage.value.trim() || contactMessage.value.trim().length < 5) {
        setError(contactMessage, contactErrorMessage, 'Please enter a message (at least 5 characters).');
        isValid = false;
      } else {
        clearError(contactMessage, contactErrorMessage);
      }

      if (!isValid) return;

      if (contactSuccessAlert) {
        contactSuccessAlert.style.display = 'flex';
      }
      contactForm.reset();

      setTimeout(() => {
        if (contactSuccessAlert) contactSuccessAlert.style.display = 'none';
      }, 8000);
    });
  }

  // Newsletter
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
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();

      if (!email || !isValidEmail(email)) {
        if (newsletterError) newsletterError.textContent = 'Please enter a valid email address.';
        newsletterEmail.classList.add('is-invalid');
        return;
      }

      if (newsletterError) newsletterError.textContent = '';
      newsletterEmail.classList.remove('is-invalid');

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
  // 12. TASTING MENU MODAL
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
  // 13. GLOBAL KEYBOARD ACCESSIBILITY
  // =========================================================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) closeMobileNav();
      if (lightboxModal && lightboxModal.style.display === 'flex') closeLightbox();
      if (confirmationModal && confirmationModal.style.display === 'flex') closeConfirmationModal();
      if (tastingModal && tastingModal.style.display === 'flex') closeTastingModal();
    }

    if (lightboxModal && lightboxModal.style.display === 'flex') {
      if (e.key === 'ArrowRight') showNextLightboxImage();
      if (e.key === 'ArrowLeft') showPrevLightboxImage();
    }
  });

});
