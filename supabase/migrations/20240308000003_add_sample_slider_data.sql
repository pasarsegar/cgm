-- Insert sample slider data
INSERT INTO public.sliders (id, name, active, slides) VALUES
('main-slider', 'Main Slider', true, '[
  {
    "id": "1",
    "title": "Premium Tuning Parts",
    "subtitle": "Upgrade Your Ride",
    "description": "Discover our collection of high-performance parts for your vehicle.",
    "image": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop",
    "buttonText": "Shop Now",
    "buttonLink": "/shop"
  },
  {
    "id": "2",
    "title": "Professional Services",
    "subtitle": "Expert Care",
    "description": "Trust our experienced technicians for all your maintenance needs.",
    "image": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1920&auto=format&fit=crop",
    "buttonText": "Our Services",
    "buttonLink": "/services"
  }
]'::jsonb)
ON CONFLICT (id) DO NOTHING;
