-- Add the small UI labels that were previously embedded in components.
-- Existing values win, so running this more than once is safe.
update public.site_settings
set value = jsonb_set(
  value,
  '{hero}',
  jsonb_build_object('cursorGreeting', 'Hi') || coalesce(value -> 'hero', '{}'::jsonb),
  true
)
where key = 'copy';

update public.site_settings
set value = jsonb_set(
  value,
  '{header}',
  jsonb_build_object(
    'navLabel', 'Primary',
    'cursorNavLabel', 'Go',
    'whatsappLabel', 'WhatsApp',
    'mobileNavLabel', 'Mobile',
    'openMenuLabel', 'Open menu',
    'closeMenuLabel', 'Close menu'
  ) || coalesce(value -> 'header', '{}'::jsonb),
  true
)
where key = 'copy';

update public.site_settings
set value = jsonb_set(
  value,
  '{work}',
  jsonb_build_object(
    'projectLabel', 'Project',
    'liveLinkLabel', 'View live',
    'codeLinkLabel', 'Code',
    'openProjectLabel', 'Open',
    'projectAltLabel', 'project'
  ) || coalesce(value -> 'work', '{}'::jsonb),
  true
)
where key = 'copy';

update public.site_settings
set value = jsonb_set(
  value,
  '{footer}',
  jsonb_build_object(
    'navLabel', 'Footer',
    'whatsappLabel', 'WhatsApp',
    'backToTopLabel', 'Back to top'
  ) || coalesce(value -> 'footer', '{}'::jsonb),
  true
)
where key = 'copy';

update public.site_settings
set value = jsonb_set(
  value,
  '{contact}',
  jsonb_build_object(
    'whatsappCta', 'Chat on WhatsApp',
    'honeypotLabel', 'Company'
  ) || coalesce(value -> 'contact', '{}'::jsonb),
  true
)
where key = 'copy';
