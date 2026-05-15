-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.product_variations CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.sub_categories CASCADE; -- Dropping this old table
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.sliders CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.widgets CASCADE;
DROP TABLE IF EXISTS public.widget_areas CASCADE;

-- Create categories table (Self-referencing for hierarchy)
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT,
    gallery TEXT[],
    rating NUMERIC DEFAULT 0,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    sub_category_id TEXT, -- For backward compatibility or direct reference if needed, but parent_id in categories handles hierarchy
    type TEXT DEFAULT 'simple',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create product variations table
CREATE TABLE public.product_variations (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL
);

-- Create pages table
CREATE TABLE public.pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    status TEXT DEFAULT 'draft',
    author_id UUID REFERENCES auth.users(id),
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending',
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order items table
CREATE TABLE public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    variation TEXT
);

-- Create menus table
CREATE TABLE public.menus (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT UNIQUE, -- e.g., 'header', 'footer'
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sliders table
CREATE TABLE public.sliders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slides JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create settings table
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT
);

-- Create widget areas table
CREATE TABLE public.widget_areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- Create widgets table
CREATE TABLE public.widgets (
    id TEXT PRIMARY KEY,
    area_id TEXT REFERENCES public.widget_areas(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Categories
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin modify categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- Products
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin modify products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- Variations
CREATE POLICY "Allow public read variations" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Allow admin modify variations" ON public.product_variations FOR ALL USING (auth.role() = 'authenticated');

-- Pages
CREATE POLICY "Allow public read pages" ON public.pages FOR SELECT USING (status = 'publish' OR auth.role() = 'authenticated');
CREATE POLICY "Allow admin modify pages" ON public.pages FOR ALL USING (auth.role() = 'authenticated');

-- Orders
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow admin read orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Order Items
CREATE POLICY "Users can see own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid()))
);
CREATE POLICY "Allow admin read order items" ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Menus
CREATE POLICY "Allow public read menus" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Allow admin modify menus" ON public.menus FOR ALL USING (auth.role() = 'authenticated');

-- Sliders
CREATE POLICY "Allow public read sliders" ON public.sliders FOR SELECT USING (true);
CREATE POLICY "Allow admin modify sliders" ON public.sliders FOR ALL USING (auth.role() = 'authenticated');

-- Settings
CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow admin modify settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

-- Widgets
CREATE POLICY "Allow public read widgets" ON public.widgets FOR SELECT USING (true);
CREATE POLICY "Allow admin modify widgets" ON public.widgets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public read widget_areas" ON public.widget_areas FOR SELECT USING (true);
CREATE POLICY "Allow admin modify widget_areas" ON public.widget_areas FOR ALL USING (auth.role() = 'authenticated');


-- Insert Initial Data

-- Categories
INSERT INTO public.categories (id, name, slug) VALUES
('1', 'Hardware & Licence', 'hardware-licence'),
('2', 'Custom Tunes', 'custom-tunes'),
('3', 'Maintenance', 'maintenance');

-- Subcategories (as children)
INSERT INTO public.categories (id, name, slug, parent_id) VALUES
('1-1', 'Flasher License', 'flasher-license', '1'),
('1-2', 'Hardware', 'hardware', '1'),
('2-1', 'Performance Mapping', 'performance-mapping', '2'),
('2-2', 'Transmission Flash', 'transmission-flash', '2'),
('3-1', 'Oil & Fluids', 'oil-fluids', '3'),
('3-2', 'Brake Parts', 'brake-parts', '3');

-- Products
INSERT INTO public.products (id, name, price, image, gallery, rating, category_id, sub_category_id, type) VALUES
('1', 'MHD FLASHER LICENCE', 617, 'https://autoparts.mythoz.com/wp-content/uploads/2025/12/mhd.jpeg', ARRAY['https://autoparts.mythoz.com/wp-content/uploads/2025/12/mhd.jpeg'], 0, '1', '1-1', 'variable'),
('2', 'CUSTOM TUNING BMW', 200, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop', ARRAY[]::text[], 5, '2', '2-1', 'variable');

-- Product Variations
INSERT INTO public.product_variations (id, product_id, name, price) VALUES
('101', '1', 'S55', 617),
('102', '1', 'N55', 617),
('103', '1', 'B58', 617),
('104', '1', 'S58', 617),
('105', '1', 'S63TU', 910),
('201', '2', 'B48 / B46', 200),
('202', '2', 'B58 Gen 1', 200),
('203', '2', 'B58 Gen 2', 200),
('204', '2', 'S58 CustomROM', 200);

-- Pages
INSERT INTO public.pages (id, title, slug, content, status) VALUES
('1', 'Home', 'home', 'Welcome to LCP Auto Cars. We provide premium car tuning and parts.', 'publish'),
('2', 'About Us', 'about-us', 'Our team has over 10 years of experience in high-performance automotive tuning.', 'publish'),
('3', 'Contact', 'contact', 'Get in touch with us for your next project.', 'publish'),
('4', 'Privacy Policy', 'privacy-policy', 'We take your privacy seriously. Here is how we handle your data.', 'draft');

-- Settings
INSERT INTO public.settings (key, value, description) VALUES
('site_title', 'Mythoz', 'The title of the website'),
('site_name', 'Mythoz', 'The name of the website'),
('site_description', 'Premium car tuning and parts', 'The description of the website');

-- Menus
INSERT INTO public.menus (id, name, location, items) VALUES
('main-menu', 'Main Menu', 'header', '[
    {"label": "Home", "url": "/"},
    {"label": "Hardware & Licence", "url": "/hardware-licence"},
    {"label": "Custom Tunes", "url": "/custom-tunes"},
    {"label": "Maintenance", "url": "/maintenance"},
    {"label": "Contact", "url": "/contact"}
]'::jsonb);
