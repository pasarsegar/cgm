-- Insert sample slider data
INSERT INTO public.sliders (id, name, active, slides) VALUES
('main-slider', 'Main Slider', true, '[
  {
    "id": "1",
    "title": "Precision Scaling Solutions",
    "subtitle": "Accurate & Reliable",
    "description": "Discover our collection of high-precision weighing systems for your business.",
    "image": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1920&auto=format&fit=crop",
    "buttonText": "Learn More",
    "buttonLink": "/about"
  },
  {
    "id": "2",
    "title": "Professional Support",
    "subtitle": "Expert Calibration",
    "description": "Trust our experienced technicians for all your maintenance and calibration needs.",
    "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1920&auto=format&fit=crop",
    "buttonText": "Our Services",
    "buttonLink": "/our-services"
  }
]'::jsonb)
ON CONFLICT (id) DO NOTHING;
