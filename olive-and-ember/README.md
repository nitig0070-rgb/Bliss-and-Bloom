# Basil & Bloom — Modern Contemporary Restaurant Website

> **Tagline:** *“Where Every Meal Becomes a Memory.”*  
> **Brand Personality:** Elegant, warm, sophisticated, welcoming, and contemporary.  
> **Location:** 24 Garden Avenue, Jaipur, Rajasthan, India

---

## 🍽️ 1. Project Overview

**Basil & Bloom** is a handcrafted, responsive, modern restaurant website built with clean HTML5, CSS3, and vanilla JavaScript. It is designed to feel like an authentic, high-end restaurant brand with an award-winning editorial look.

### Key Highlights:
- **Zero Frontend Frameworks:** Pure semantic HTML5, modern CSS3, and vanilla JavaScript (no React, Vue, Angular, Node.js, or npm builds required).
- **Custom Eased Smooth Scroll Engine:** Custom physics-based `easeInOutCubic` scroll engine via `requestAnimationFrame` that delivers a silky-smooth, jitter-free glide and exact header-offset landing with visual target highlight.
- **Top Reading / Scroll Progress Bar:** Interactive 3px terracotta-gold gradient progress indicator at the top of the viewport.
- **Client-Side Persistence & Live Pass Preview:** Demo table reservations are simulated and saved in the browser’s `localStorage`, with a live updating boarding pass / ticket preview as you type.
- **Editorial Luxury Aesthetics:** Google Fonts (`Playfair Display` and `DM Sans`) paired with warm earthy tones (Deep Forest Green `#173D32`, Warm Ivory `#FAF7F0`, Terracotta `#C66A45`, Soft Sage `#DCE5D9`, and Artisan Gold `#C5A059`).

---

## 🎨 2. Brand Identity & Color Palette

| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Forest Green** | `#173D32` | Primary brand accent, headings, and footer background |
| **Warm Ivory** | `#FAF7F0` | Body background, soft contrast surface |
| **Terracotta** | `#C66A45` | Primary CTA buttons, badges, and warm accents |
| **Soft Sage** | `#DCE5D9` | Secondary backgrounds, icon containers, subtle tags |
| **Charcoal** | `#252724` | Primary high-readability body text |
| **Warm White** | `#FFFFFF` | Clean card surfaces and elevated modals |
| **Artisan Gold** | `#C5A059` | Chef's special badges, stars, and seal borders |

---

## 📁 3. Project File Structure

```text
AIClass_Project/
├── index.html                  # Root index file for immediate local preview
├── css/
│   └── style.css               # Root stylesheet
├── js/
│   └── script.js               # Root vanilla JavaScript
├── assets/
│   └── images/                 # Image assets folder
├── basil-and-bloom/            # Dedicated standalone distribution folder
│   ├── index.html              # Complete semantic website markup
│   ├── css/
│   │   └── style.css           # Full styling, transitions, responsiveness
│   ├── js/
│   │   └── script.js           # Navigation, filters, lightbox, validation
│   └── assets/
│       └── images/             # Asset storage
└── README.md                   # Complete documentation & deployment guide
```

---

## 🚀 4. Setup and How to Run Locally

Because this project uses vanilla web standards, **no build step, package manager, or compilation is required**.

### Option A: Double-Click (Simplest)
1. Navigate to the project folder (`AIClass_Project` or `basil-and-bloom`).
2. Double-click `index.html` to open it in your browser (Chrome, Edge, Safari, Firefox).

### Option B: Using VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Click **"Go Live"** on the bottom right status bar (or right-click `index.html` and select **"Open with Live Server"**).
3. The website will open at `http://127.0.0.1:5500`.

### Option C: Using Python Simple HTTP Server
Open your terminal inside the project directory and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## ✨ 5. Key UI & Interaction Enhancements

1. **Custom Eased Smooth Scrolldown Engine:**
   - Replaced browser-native jumpy scroll with a custom `easeInOutCubic` interpolation loop running on `requestAnimationFrame`.
   - Dynamically calculates destination position using exact live sticky-header offset (74px + breathing room).
   - Features a **Section Landing Glow** effect (`.section-target-highlight`) that warmly accents the section header for 1.4 seconds upon arrival.
   - Provides instant active tab highlighting on click.

2. **Scroll Reading Progress Bar:**
   - 3px terracotta-gold gradient bar at the top of the page that dynamically tracks reading progression.

3. **Floating Hearth Embers:**
   - Subtle glowing ambient sparks drifting upward in the hero section, evoking a cozy wood-fired hearth.

4. **Authentic Vegetarian Emblems:**
   - Standard green framed square dot badges on all handcrafted dish cards, highlighting the artisanal vegetarian menu.

5. **Live Dining Pass Preview:**
   - Interactive ticket card in the reservation section that dynamically mirrors guest name, date, seating time, party size, and occasion in real time.

6. **Quick Dish Reservation:**
   - Clicking *"Reserve Table →"* on any menu card pre-fills the special requests field with that dish and smoothly glides to the booking form.

7. **Gallery Category Tabs:**
   - Filter gallery photos by *All Photos*, *Culinary Art*, *Ambience & Hearth*, and *Sweets & Drinks*.

8. **Live Restaurant Operating Status:**
   - Dynamically checks the current hour and displays an *"Open Today until 10:30 PM"* badge.

9. **Scroll Reveal Animations:**
   - Elements smoothly fade and slide in as they enter viewport using `IntersectionObserver`.

---

## ✅ 6. Checklist of Tested Interactions

- [x] **Silky Smooth Navigation Scroll:** Click any navbar link to glide with custom `easeInOutCubic` easing and landing highlight.
- [x] **Scroll Progress Bar:** Real-time percentage indicator at top of viewport.
- [x] **Sticky Navbar:** Smooth glassmorphic background blur and compact state after 35px scroll.
- [x] **Mobile Menu Toggle:** Hamburger button animates to an 'X'; drawer slides open with background scroll-lock; auto-closes on link select.
- [x] **Scrollspy:** Nav links update active state dynamically as sections scroll past.
- [x] **Menu Filtering:** Category filter buttons smoothly transition cards by category.
- [x] **Dish Quick-Reserve:** Pre-populates selected dish into the reservation request and scrolls down.
- [x] **Tasting Menu Modal:** Opens 5-course journey modal; closes on 'X', backdrop click, or Escape key.
- [x] **Experience Card Linking:** Pre-selects occasion in reservation form and smooth-scrolls.
- [x] **Gallery Lightbox & Tabs:** Category tabs filter images; click thumbnail opens full-screen lightbox with captions, counter, and keyboard navigation.
- [x] **Reservation Form Validation:** Rejects invalid emails, short phone numbers, past dates; clears errors on input; updates live ticket pass.
- [x] **Confirmation Modal:** Displays booking reference code, receipt details, and stores booking in `localStorage`.
- [x] **Testimonial Carousel:** Auto-plays every 6s, pauses on hover, and supports next/prev arrow buttons.
- [x] **Contact & Newsletter Forms:** Client-side validation with friendly demo success alerts.
- [x] **Floating Back to Top:** Appears after 380px of scrolling; smoothly glides back to top.
