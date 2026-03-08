-- Add more sample products
INSERT INTO public.products (id, name, price, image, gallery, rating, category_id, sub_category_id, type, description) VALUES
('3', 'MHD WIFI Adapter', 69.00, 'https://burgertuning.com/cdn/shop/products/MHD_Adapter_black_orange_1_1024x1024.jpg?v=1600100494', ARRAY['https://burgertuning.com/cdn/shop/products/MHD_Adapter_black_orange_1_1024x1024.jpg?v=1600100494'], 5, '1', '1-2', 'simple', 'The fastest and most reliable OBD adapter for F and G series BMWs.'),
('4', 'NGK Spark Plugs (Set of 6)', 95.00, 'https://m.media-amazon.com/images/I/71wK+1tOQdL._AC_SL1500_.jpg', ARRAY['https://m.media-amazon.com/images/I/71wK+1tOQdL._AC_SL1500_.jpg'], 4.8, '3', '3-1', 'simple', 'High performance spark plugs recommended for tuned engines.'),
('5', 'XHP Flashtool License', 349.00, 'https://www.xhpflashtool.com/images/content/connect_screen.jpg', ARRAY['https://www.xhpflashtool.com/images/content/connect_screen.jpg'], 4.9, '1', '1-1', 'simple', 'Unlock the hidden potential of your automatic transmission.')
ON CONFLICT (id) DO NOTHING;

-- Add variations for existing variable products if missing (just to be safe)
-- (Already handled in initial schema for products 1 and 2)
