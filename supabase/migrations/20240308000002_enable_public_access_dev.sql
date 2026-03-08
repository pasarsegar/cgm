-- Enable public access for all tables (Development Mode)
-- WARN: Only use this in development! This allows anyone to modify your data.

-- Categories
DROP POLICY IF EXISTS "Allow admin modify categories" ON public.categories;
CREATE POLICY "Allow public modify categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Products
DROP POLICY IF EXISTS "Allow admin modify products" ON public.products;
CREATE POLICY "Allow public modify products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Variations
DROP POLICY IF EXISTS "Allow admin modify variations" ON public.product_variations;
CREATE POLICY "Allow public modify variations" ON public.product_variations FOR ALL USING (true) WITH CHECK (true);

-- Pages
DROP POLICY IF EXISTS "Allow admin modify pages" ON public.pages;
CREATE POLICY "Allow public modify pages" ON public.pages FOR ALL USING (true) WITH CHECK (true);

-- Menus
DROP POLICY IF EXISTS "Allow admin modify menus" ON public.menus;
CREATE POLICY "Allow public modify menus" ON public.menus FOR ALL USING (true) WITH CHECK (true);

-- Sliders
DROP POLICY IF EXISTS "Allow admin modify sliders" ON public.sliders;
CREATE POLICY "Allow public modify sliders" ON public.sliders FOR ALL USING (true) WITH CHECK (true);

-- Settings
DROP POLICY IF EXISTS "Allow admin modify settings" ON public.settings;
CREATE POLICY "Allow public modify settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- Widgets
DROP POLICY IF EXISTS "Allow admin modify widgets" ON public.widgets;
CREATE POLICY "Allow public modify widgets" ON public.widgets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin modify widget_areas" ON public.widget_areas;
CREATE POLICY "Allow public modify widget_areas" ON public.widget_areas FOR ALL USING (true) WITH CHECK (true);
