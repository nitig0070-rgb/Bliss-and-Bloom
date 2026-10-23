-- =========================================================================
-- Bliss & Bloom Restaurant — Supabase Database Schema
-- Run this complete script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================================

-- 1. Table: Reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    booking_ref TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests INTEGER NOT NULL CHECK (guests >= 1 AND guests <= 20),
    occasion TEXT DEFAULT 'Casual Dining',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_email ON public.reservations (email);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_ref ON public.reservations (booking_ref);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow any visitor (guest or authenticated) to create a reservation
CREATE POLICY "Allow public insert to reservations" 
ON public.reservations 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Policy: Users can view their own reservations (by user_id or matching email)
CREATE POLICY "Users can view their own reservations" 
ON public.reservations 
FOR SELECT 
TO public 
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.jwt() ->> 'email' IS NOT NULL AND auth.jwt() ->> 'email' = email)
);

-- Policy: Users can update/cancel their own reservations
CREATE POLICY "Users can update their own reservations" 
ON public.reservations 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reservations
CREATE POLICY "Users can delete their own reservations" 
ON public.reservations 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);


-- =========================================================================
-- 2. Table: Contact Messages (Optional Supabase mirror alongside Google Sheets)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts (created_at DESC);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a contact message
CREATE POLICY "Allow public insert to contacts" 
ON public.contacts 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Authenticated users can view their own submitted messages
CREATE POLICY "Users can view their own contact messages" 
ON public.contacts 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);


-- =========================================================================
-- 3. Table: Newsletter Subscribers
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    email TEXT UNIQUE NOT NULL
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
TO public 
WITH CHECK (true);

-- =========================================================================
-- Schema setup complete!
-- =========================================================================
