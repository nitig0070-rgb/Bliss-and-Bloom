/**
 * Bliss & Bloom — Cloud Services Configuration
 * 
 * This file contains configuration keys for:
 * 1. Supabase (Database & Authentication)
 * 2. Google Sheets (Form Submissions Webhook via Google Apps Script)
 * 
 * HOW TO CONFIGURE:
 * -----------------
 * 1. SUPABASE:
 *    - Create a free project at https://supabase.com
 *    - Go to Project Settings > API
 *    - Copy "Project URL" and paste it into SUPABASE_URL below.
 *    - Copy "anon public" key and paste it into SUPABASE_ANON_KEY below.
 *    - Run the SQL script from `supabase-schema.sql` in the Supabase SQL Editor.
 * 
 * 2. GOOGLE SHEETS:
 *    - Create a new Google Sheet at https://sheets.new
 *    - Go to Extensions > Apps Script
 *    - Paste the code from `google-apps-script.js`
 *    - Click Deploy > New deployment > Select "Web app"
 *    - Set "Execute as": Me, "Who has access": Anyone
 *    - Click Deploy and copy the Web App URL into GOOGLE_SHEET_WEBHOOK_URL below.
 * 
 * NOTE: The website includes an interactive in-browser Cloud Settings modal
 * (accessible via the "Cloud Connect" button in the footer or navbar)
 * where you can also enter, test, and save these credentials live!
 */

(function () {
  'use strict';

  // Default configuration placeholders
  const DEFAULT_CONFIG = {
    // Supabase project credentials
    SUPABASE_URL: 'https://xaviolkpbeqwfutrruhw.supabase.co', // e.g., 'https://your-project-ref.supabase.co'
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdmlvbGtwYmVxd2Z1dHJydWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NzI0NjYsImV4cCI6MjEwODM0ODQ2Nn0.tq6MlcdPSKTEqjTq_81gx18cZU8CB0Od6vCWpW280oA', // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

    // Google Sheets Apps Script Web App URL
    GOOGLE_SHEET_WEBHOOK_URL: '' // e.g., 'https://script.google.com/macros/s/AKfycb.../exec'
  };

  const STORAGE_KEY = 'bliss_bloom_cloud_config';

  // Load any stored overrides from localStorage (set via in-browser settings modal)
  const getStoredOverrides = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Could not read stored cloud config:', e);
      return {};
    }
  };

  const stored = getStoredOverrides();

  // Active configuration (overrides take precedence if present)
  window.ENV_CONFIG = {
    SUPABASE_URL: stored.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: stored.SUPABASE_ANON_KEY || DEFAULT_CONFIG.SUPABASE_ANON_KEY || '',
    GOOGLE_SHEET_WEBHOOK_URL: stored.GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_CONFIG.GOOGLE_SHEET_WEBHOOK_URL || ''
  };

  // Helper checks
  window.ENV_CONFIG.isSupabaseConfigured = function () {
    return Boolean(
      this.SUPABASE_URL &&
      this.SUPABASE_URL.startsWith('https://') &&
      !this.SUPABASE_URL.includes('your-project-ref') &&
      this.SUPABASE_ANON_KEY &&
      this.SUPABASE_ANON_KEY.length > 20 &&
      !this.SUPABASE_ANON_KEY.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
    );
  };

  window.ENV_CONFIG.isGoogleSheetsConfigured = function () {
    return Boolean(
      this.GOOGLE_SHEET_WEBHOOK_URL &&
      this.GOOGLE_SHEET_WEBHOOK_URL.startsWith('https://script.google.com/macros/s/') &&
      this.GOOGLE_SHEET_WEBHOOK_URL.includes('/exec')
    );
  };

  // Save config from in-browser UI
  window.ENV_CONFIG.saveOverrides = function (newConfig) {
    try {
      const current = getStoredOverrides();
      const updated = { ...current, ...newConfig };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      Object.assign(window.ENV_CONFIG, updated);
      return true;
    } catch (e) {
      console.error('Failed to save config overrides:', e);
      return false;
    }
  };

  // Reset to default
  window.ENV_CONFIG.resetOverrides = function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.ENV_CONFIG.SUPABASE_URL = DEFAULT_CONFIG.SUPABASE_URL;
      window.ENV_CONFIG.SUPABASE_ANON_KEY = DEFAULT_CONFIG.SUPABASE_ANON_KEY;
      window.ENV_CONFIG.GOOGLE_SHEET_WEBHOOK_URL = DEFAULT_CONFIG.GOOGLE_SHEET_WEBHOOK_URL;
      return true;
    } catch (e) {
      return false;
    }
  };
})();
