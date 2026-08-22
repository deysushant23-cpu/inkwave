-- Migration to add essential CMS configurations to fully eliminate hardcoded fallbacks

INSERT INTO public.cms_sections (section_key, json_content, is_published)
VALUES 
(
  'homepage_config', 
  '{
    "heroTitle": "Small batch, ink-dyed menswear.",
    "heroSubtitle": "Designed to move, built to hold its shape.",
    "heroVideoUrl": "https://res.cloudinary.com/mlcybvye/video/upload/v1740039230/hero_c6bwnb.mp4",
    "heroVideoPoster": "https://res.cloudinary.com/mlcybvye/image/upload/v1740039223/hero_poster_w1s6tb.webp",
    "heroButtonText": "Shop Collection",
    "heroButtonLink": "/archive",
    "marqueeItems": [
      { "text": "New drop — Vol. 04", "link": "" },
      { "text": "Free shipping over ₹2000", "link": "" },
      { "text": "Small batch, never restocked", "link": "" },
      { "text": "Dyed in small vats", "link": "" }
    ],
    "giantMarqueeText": "INKWAVE // VOL 04 // NO TWO VATS RUN IDENTICAL //",
    "giantMarqueeLink": ""
  }'::jsonb, 
  true
)
ON CONFLICT (section_key) DO UPDATE SET json_content = EXCLUDED.json_content;

INSERT INTO public.cms_sections (section_key, json_content, is_published)
VALUES 
(
  'new_drops_config', 
  '{
    "slugs": []
  }'::jsonb, 
  true
)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.cms_sections (section_key, json_content, is_published)
VALUES 
(
  'curated_fits_config', 
  '{
    "fits": []
  }'::jsonb, 
  true
)
ON CONFLICT (section_key) DO NOTHING;

INSERT INTO public.cms_sections (section_key, json_content, is_published)
VALUES 
(
  'footer_config', 
  '{
    "columns": [
      {
        "title": "Help",
        "links": [
          { "label": "Shipping & returns", "url": "/pages/shipping" },
          { "label": "Size guide", "url": "/pages/size-guide" },
          { "label": "Track order", "url": "/pages/track-order" },
          { "label": "Contact", "url": "/pages/contact" }
        ]
      },
      {
        "title": "Studio",
        "links": [
          { "label": "About", "url": "/pages/about" },
          { "label": "Lookbook", "url": "/pages/lookbook" },
          { "label": "Journal", "url": "/pages/journal" },
          { "label": "Careers", "url": "/pages/careers" }
        ]
      },
      {
        "title": "Follow",
        "links": [
          { "label": "Instagram", "url": "https://www.instagram.com/inkwavefashion?igsh=M3ExbWZqZ2ZyN284" }
        ]
      }
    ]
  }'::jsonb, 
  true
)
ON CONFLICT (section_key) DO UPDATE SET json_content = EXCLUDED.json_content;
