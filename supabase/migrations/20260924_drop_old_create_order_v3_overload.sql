-- Migration: Drop the obsolete 17-parameter overload of create_order_v3 to eliminate function overloading conflict.
-- The 18-parameter version (accepting p_idempotency_key VARCHAR) is the authoritative implementation.

DROP FUNCTION IF EXISTS public.create_order_v3(
  UUID,
  NUMERIC,
  NUMERIC,
  NUMERIC,
  NUMERIC,
  NUMERIC,
  NUMERIC,
  TEXT,
  NUMERIC,
  NUMERIC,
  NUMERIC,
  JSONB,
  JSONB,
  TEXT,
  TEXT,
  TEXT,
  JSONB
);
