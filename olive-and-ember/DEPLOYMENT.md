# Bliss & Bloom — Deployment & Cloud Integration Guide

This guide details how to deploy **Bliss & Bloom** to **Vercel**, configure **Supabase** for user authentication & reservations database, and connect **Google Sheets** for contact and newsletter form submissions.

---

## 🚀 1. Deploying on Vercel (Fastest & Free)

Since Bliss & Bloom is built with modern vanilla HTML5, CSS3, and JavaScript, it deploys to Vercel in seconds with zero build steps.

### Method A: Deploy via GitHub (Recommended)
1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click the **"Add New..."** button and select **"Project"**.
3. Under **"Import Git Repository"**, find and select `nitig0070-rgb/Bliss-and-Bloom`.
4. In the configuration screen:
   - **Framework Preset:** Select **"Other"** (or leave as auto-detected).
   - **Root Directory:** Leave as `./` (default).
   - **Build & Output Settings:** Leave defaults empty (no build command needed).
5. Click **"Deploy"**.
6. Vercel will provision your site in ~15 seconds and give you a live production URL (e.g. `https://bliss-and-bloom.vercel.app`).
7. Any future git commits pushed to `main` will automatically trigger instant atomic deployments!

### Method B: Deploy via Vercel CLI
If you have Node.js and the Vercel CLI installed:
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🗄️ 2. Supabase Integration (Auth + Database)

Supabase provides backend authentication (email/password login & registration) and a PostgreSQL database for storing table bookings.

### Step 1: Create a Supabase Project
1. Visit [supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Choose an organization, enter Name: `Bliss and Bloom`, set a strong database password, and select your nearest region.
4. Click **"Create new project"** (takes ~1 minute to spin up).

### Step 2: Run the Database Schema
1. In your Supabase project dashboard, navigate to the **"SQL Editor"** (icon with `>_` on the left sidebar).
2. Click **"New Query"**.
3. Open [`supabase-schema.sql`](./supabase-schema.sql) in this repository, copy its entire contents, and paste it into the editor.
4. Click the green **"Run"** button.
5. You should see `Success. No rows returned`.
   This creates:
   - `reservations` table (with Row-Level Security for users to see and cancel their bookings)
   - `contacts` table (optional database mirror for inquiries)
   - `newsletter_subscribers` table

### Step 3: Enable Email / Password Authentication
1. Go to **Authentication** > **Providers** on the left menu.
2. Verify **Email** is enabled (it is on by default).
3. Under **Authentication** > **URL Configuration**, add your Vercel site URL (e.g. `https://bliss-and-bloom.vercel.app`) to **Site URL** and **Redirect URLs**.
4. *(Optional for testing)*: Under **Authentication** > **Providers** > **Email**, you can toggle off **"Confirm email"** if you want new signups to be logged in immediately without waiting for a confirmation email.

### Step 4: Copy API Credentials
1. In Supabase, go to **Project Settings** (gear icon at bottom left) > **API**.
2. Copy:
   - **Project URL** (e.g. `https://your-id.supabase.co`)
   - **Project API Keys** > `anon` `public` key (long string starting with `eyJhbGci...`)
3. Paste these values into [`js/config.js`](./js/config.js):
   ```javascript
   SUPABASE_URL: 'https://your-project-ref.supabase.co',
   SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   ```
   *(Or click "Cloud Connect" in the website's footer to paste them live in the browser without modifying code!)*

---

## 📊 3. Google Sheets Integration (Contact & Newsletter Forms)

Google Sheets collects incoming inquiries and newsletter subscriptions into an organized spreadsheet in real-time.

### Step 1: Create the Spreadsheet
1. Go to [Google Sheets](https://sheets.new) to create a new spreadsheet.
2. Name it: `Bliss & Bloom — Website Submissions`.

### Step 2: Add the Google Apps Script
1. In Google Sheets, click **Extensions** > **Apps Script**.
2. Delete the placeholder code inside `Code.gs`.
3. Open [`google-apps-script.js`](./google-apps-script.js) from this repository, copy the entire code, and paste it into `Code.gs`.
4. Click the **Save** (disk) icon or press `Ctrl + S`.

### Step 3: Deploy as a Web App
1. Click the blue **"Deploy"** button at the top-right, then select **"New deployment"**.
2. Click the gear icon next to "Select type" and choose **"Web app"**.
3. Configure:
   - **Description:** `Bliss & Bloom Webhook`
   - **Execute as:** `Me (your_email@gmail.com)`
   - **Who has access:** `Anyone` *(Crucial: Allows the website's frontend to post data)*
4. Click **Deploy**.
5. Click **"Authorize access"**:
   - Choose your Google account.
   - Click **"Advanced"** (bottom left of modal).
   - Click **"Go to Bliss & Bloom Webhook (unsafe)"**.
   - Click **"Allow"**.
6. Copy the **Web App URL** (format: `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 4: Link to Website
Paste your Web App URL into [`js/config.js`](./js/config.js):
```javascript
GOOGLE_SHEET_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
```
When forms are submitted, three organized tabs are created automatically:
- **Contact Messages** (Timestamp, Name, Email, Phone, Message)
- **Newsletter Subscribers** (Timestamp, Email)
- **Table Reservations** (Timestamp, Ref, Name, Email, Phone, Date, Time, Guests, Occasion, Notes)

---

## 🧪 4. Real User Authentication & Authorization Testing

Authentication and authorization in Bliss & Bloom are built directly on top of **Supabase Auth** and **PostgreSQL Row Level Security (RLS)**:
- **Real User Identity:** Every user has their own distinct Supabase UUID (`auth.uid()`), verified email, and profile name.
- **Strict Authorization:** 
  - Authenticated users can **only view their own reservations** (`user_id = auth.uid()`).
  - Authenticated users can **only cancel/update their own reservations**.
  - Anonymous or unauthorized users cannot access another patron's reservations.
- **Profile Synchronization:** When a user registers, their profile information (`full_name`, `email`) is automatically synced via database triggers.
- **In-Browser Cloud Settings:** You can click the **"Cloud Connect"** button in the website footer or user menu to paste credentials live and test real-time Supabase Auth and Google Sheets submissions immediately.
