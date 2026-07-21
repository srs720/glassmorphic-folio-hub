
UPDATE public.site_settings
SET greeting = 'Hey, I''m Shoibur Rahman.',
    bio = 'Shoibur Rahman. Student of Darunnazat Siddikia Kamil Madrasah and passionate full-stack web developer.',
    identity_line = 'Student · Full-stack web developer'
WHERE id = '6a4bbfd8-8fd8-4930-892e-de37cc0bc6dc';

UPDATE public.education_entries
SET institution = 'Darunnazat Siddikia Kamil Madrasah'
WHERE institution = 'General Jim';
