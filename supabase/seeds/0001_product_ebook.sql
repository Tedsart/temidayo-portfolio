-- =============================================================================
-- Optional starter content: the first digital product.
--
-- This is DATA, not code — everything below is editable from the CMS at
-- /admin/products afterwards. It is deliberately seeded WITHOUT a Selar URL,
-- because the site only shows a product once it has somewhere to send readers.
-- Paste the real Selar product or checkout URL in the CMS and the section
-- appears on its own; no deploy needed.
--
-- Re-running is safe: nothing is overwritten once the slug exists.
-- =============================================================================

insert into public.products (
  type,
  title,
  slug,
  subtitle,
  short_description,
  long_description,
  price_amount,
  currency,
  button_text,
  author,
  format,
  audience,
  outcomes,
  featured,
  sort_order,
  enabled,
  published
)
values (
  'ebook',
  'Before You Believe the Number',
  'before-you-believe-the-number',
  'A practical guide to thinking clearly in a world full of data, statistics and AI',
  'A practical book about percentages, averages, charts, statistics, evidence and the increasingly convincing answers produced by AI.',
  'A practical guide to understanding percentages, averages, charts, statistics, evidence and increasingly confident AI-generated answers — so you can question numbers before they influence what you believe.',
  2500,
  'NGN',
  'Get the book',
  'Temidayo Kukoyi',
  'PDF',
  'For curious people who encounter numbers, statistics, charts, claims and AI-generated information in everyday life and want to understand what those numbers actually mean.',
  '[
    "Spot missing context behind percentages",
    "Understand why averages can hide important differences",
    "Read charts more critically",
    "Separate correlation from causation",
    "Ask better questions about statistics",
    "Question confident AI-generated answers",
    "Use a simple five-step framework for evaluating numbers"
  ]'::jsonb,
  true,
  10,
  true,
  true
)
on conflict (slug) do nothing;
