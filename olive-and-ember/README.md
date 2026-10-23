# Bliss & Bloom — Modern Contemporary Restaurant Website

> **Tagline:** *“Where Every Meal Becomes a Memory.”*  
> **Brand Personality:** Elegant, warm, sophisticated, welcoming, and contemporary.  
> **Location:** 24 Garden Avenue, Jaipur, Rajasthan, India  
> **Live GitHub Repo:** [nitig0070-rgb/Bliss-and-Bloom](https://github.com/nitig0070-rgb/Bliss-and-Bloom)

---

## 🍽️ 1. Project Overview

**Bliss & Bloom** is a premium, fully responsive modern restaurant website built with clean **HTML5**, **CSS3**, and **Vanilla JavaScript**. It delivers an authentic, editorial dining experience coupled with modern cloud integrations:
- **Vercel** for instant, atomic production deployment with custom security headers and cache policies.
- **Supabase** for user authentication (Sign In, Sign Up, Password Recovery) and cloud database storage for table bookings with Row-Level Security (RLS).
- **Google Sheets** for real-time contact and newsletter submissions via a serverless Google Apps Script webhook.
- **Pure Client-Side Architecture:** Zero heavy frameworks (no React, Angular, Vue, or Node builds required). Works immediately by opening `index.html` in any browser!

---

## 🎨 2. Brand Identity & Color Palette

| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Forest Green** | `#173D32` | Primary brand accent, headings, and site footer |
| **Warm Ivory** | `#FAF7F0` | Body background, soft contrast surface |
| **Terracotta** | `#C66A45` | Primary CTA buttons, badges, and warm accents |
| **Soft Sage** | `#DCE5D9` | Secondary backgrounds, icon containers, subtle tags |
| **Charcoal** | `#252724` | Primary high-readability body text |
| **Warm White** | `#FFFFFF` | Clean card surfaces and elevated dialog modals |
| **Artisan Gold** | `#C5A059` | Chef's special badges, stars, and seal borders |

---

## 📁 3. Project File Structure

```text
AIClass_Project/
├── index.html                  # Main responsive single-page website markup
├── vercel.json                 # Vercel deployment configuration & security headers
├── supabase-schema.sql         # Supabase PostgreSQL schema & RLS security policies
├── google-apps-script.js       # Google Apps Script code for Google Sheets webhook
├── DEPLOYMENT.md               # Step-by-step Vercel, Supabase & Google Sheets guide
├── README.md                   # Comprehensive project documentation
├── css/
│   └── style.css               # Full CSS styles, animations, variables & responsive rules
├── js/
│   ├── config.js               # Centralized configuration & localStorage overrides
│   └── script.js               # Vanilla JS: Smooth scroll, Supabase Auth, Forms & Modals
└── assets/                     # Supporting media and image assets
```

---

## 🚀 4. Cloud Services & Integrations

### A. Vercel Deployment
The repository includes a production-ready [`vercel.json`](./vercel.json) configuration:
1. Sign in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** > **Project** and import `nitig0070-rgb/Bliss-and-Bloom`.
3. Keep default settings (`Other` framework preset, `./` root directory).
4. Click **Deploy**. Your site will be live on a global CDN in ~15 seconds!

### B. Supabase (Authentication & PostgreSQL Database)
- **CDN Library:** Loaded directly via `@supabase/supabase-js@2`.
- **Authentication:** Supports email/password login, account registration with full names, password recovery, and session persistence.
- **Database:** Stores table reservations into the `reservations` table.
- **Schema & RLS:** Run [`supabase-schema.sql`](./supabase-schema.sql) in your Supabase SQL Editor. Row Level Security ensures guests can reserve tables while authenticated users can view and cancel their own bookings!
- **User Dashboard:** Logged-in users can click their profile avatar in the header to view **"My Reservations"** and cancel upcoming bookings live.

### C. Google Sheets (Form Submissions Webhook)
- **Contact Messages & Newsletter:** Inquiries submitted through the Contact Form or Newsletter Form are sent directly to Google Sheets via a Google Apps Script Web App.
- **Apps Script:** Copy and paste [`google-apps-script.js`](./google-apps-script.js) into your Google Sheet (`Extensions > Apps Script`), deploy as Web App (`Access: Anyone`), and paste the generated URL into `js/config.js`.
- Automatically generates three formatted tabs:
  - `Contact Messages`
  - `Newsletter Subscribers`
  - `Table Reservations`

### D. In-Browser Cloud Settings Modal
You don't even need to edit files to test live integrations! Click the **"Cloud Connect"** button in the website footer or user profile dropdown to paste your Supabase keys and Google Sheets URL directly in the browser. Credentials are saved locally and activate live cloud mode immediately.

---

## 💻 5. How to Run Locally

Because this project uses vanilla web standards, **no build step or package manager is required**.

### Option A: Direct Open
Double-click `index.html` in your file explorer to open it in Chrome, Edge, Safari, or Firefox.

### Option B: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Click **"Go Live"** on the bottom right status bar (or right-click `index.html` and select **"Open with Live Server"**).
3. The website will open at `http://127.0.0.1:5500`.

### Option C: Python Simple HTTP Server
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## ✨ 6. Key UI & Interaction Features

1. **Custom Eased Smooth Scrolldown Engine:**
   Physics-based `easeInOutCubic` smooth scrolling via `requestAnimationFrame` with exact header offset landing and a landing glow pulse effect (`.section-target-highlight`).
2. **Top Reading Progress Bar:**
   Terracotta-gold gradient progress indicator at the top of the viewport.
3. **Floating Hearth Embers:**
   Ambient sparks floating upward in the hero section, evoking a wood-fired hearth.
4. **Live Boarding Pass Ticket Preview:**
   Interactive ticket in the reservation section that dynamically mirrors guest name, date, seating time, party size, and occasion as you type.
5. **Authentic Vegetarian Emblems:**
   Framed square green dot emblems marking each artisanal vegetarian dish.
6. **Gallery Lightbox & Category Filters:**
   Filter photos by culinary art, ambience, and drinks; open full-screen lightbox with keyboard arrow navigation.
7. **Chef's Five-Course Tasting Journey Modal:**
   Interactive tasting menu modal detailing the seasonal chef's experience with instant reservation pre-fill.
8. **Dynamic Restaurant Operating Status:**
   Evaluates live local time to display *"Open Today until 10:30 PM"* or opening hours.
9. **Dual Demo & Cloud Storage:**
   Gracefully runs in offline/demo mode using `localStorage` if cloud keys are omitted, and upgrades seamlessly to Supabase and Google Sheets when keys are provided.

---

## 📖 7. Documentation Links

- **Deployment Guide:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Supabase SQL Schema:** [`supabase-schema.sql`](./supabase-schema.sql)
- **Google Apps Script Code:** [`google-apps-script.js`](./google-apps-script.js)
- **API Configuration:** [`js/config.js`](./js/config.js)
