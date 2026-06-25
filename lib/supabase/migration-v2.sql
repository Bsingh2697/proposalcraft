-- Run this in Supabase SQL Editor before deploying the next release.
-- Go to: Supabase project → SQL Editor → New query → paste → Run

-- Add freelancer profile columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS freelancer_name    TEXT,
ADD COLUMN IF NOT EXISTS freelancer_skills  TEXT,
ADD COLUMN IF NOT EXISTS freelancer_bio     TEXT;

-- Add platform column to proposals table
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'general'
  CHECK (platform IN ('upwork', 'fiverr', 'linkedin', 'general'));
