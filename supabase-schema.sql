-- =========================================================================
-- Bliss & Bloom Restaurant — Supabase Database Schema & RLS Security
-- Production-Ready User-Specific Authentication & Authorization
-- =========================================================================

-- 1. Table: Profiles (Synchronized with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies: Strictly user-specific
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Function & Trigger to automatically create a user profile upon Supabase signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================================
-- 2. Table: Reservations (Strict User Authorization)
-- =========================================================================
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Optimized Indexes
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON public.reservations (email);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_ref ON public.reservations (booking_ref);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Insertion
-- Authenticated users insert with their own user_id; guest visitors insert with user_id = null
CREATE POLICY "Allow authenticated or guest insertion"
ON public.reservations
FOR INSERT
TO public
WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL) OR
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Policy 2: Strict User-Specific Selection (Authorization)
-- Authenticated users can ONLY view reservations belonging to their own user_id
CREATE POLICY "Users can only view their own reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Strict User-Specific Updates (e.g. Cancelling a Booking)
-- Authenticated users can ONLY update reservations that belong to them
CREATE POLICY "Users can only update their own reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Strict User-Specific Deletion
CREATE POLICY "Users can only delete their own reservations"
ON public.reservations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- =========================================================================
-- 3. Table: Contacts (Inquiries)
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

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to submit inquiries"
ON public.contacts
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view their own inquiries"
ON public.contacts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- =========================================================================
-- 4. Table: Newsletter Subscribers
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    email TEXT UNIQUE NOT NULL
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public newsletter subscription"
ON public.newsletter_subscribers
FOR INSERT
TO public
WITH CHECK (true);
