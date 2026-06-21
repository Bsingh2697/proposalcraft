-- Run this entire file in the Supabase SQL editor to set up the database.
-- Go to: your Supabase project → SQL Editor → New query → paste → Run

-- ============================================================
-- PROFILES
-- Extends Supabase's built-in auth.users table.
-- Created automatically when a new user signs up (via trigger below).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPOSALS
-- Every generated proposal is stored here.
-- Users can only read/delete their own rows (enforced by RLS below).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_description TEXT NOT NULL,
  skills TEXT,
  tone TEXT NOT NULL DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'bold')),
  output TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USAGE
-- Tracks monthly proposal usage per user.
-- One row per user. Reset automatically each month.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  proposals_this_month INT NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Enforces that users can only access their own data.
-- Even if someone bypasses the app, the DB refuses unauthorized reads.
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read and update their own profile
CREATE POLICY "profiles: own row only"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id);

-- Proposals: users can only read and delete their own proposals
CREATE POLICY "proposals: own rows only"
  ON public.proposals
  FOR ALL
  USING (auth.uid() = user_id);

-- Usage: users can only read their own usage record
CREATE POLICY "usage: own row only"
  ON public.usage
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile + usage row on new user signup
-- Fires after a new row is inserted into auth.users.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  INSERT INTO public.usage (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: increment_usage
-- Called from the server after a proposal is generated.
-- Atomic increment to prevent race conditions.
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.usage
  SET proposals_this_month = proposals_this_month + 1
  WHERE user_id = p_user_id;
END;
$$;
