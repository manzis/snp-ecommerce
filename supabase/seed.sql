-- Seed Data for eCommerce Store
-- Run this after running schema.sql to get initial mock data

-- Categories
INSERT INTO categories (id, name, slug) VALUES 
('c1000000-0000-0000-0000-000000000000', 'Proteins', 'proteins'),
('c2000000-0000-0000-0000-000000000000', 'Creatine', 'creatine'),
('c3000000-0000-0000-0000-000000000000', 'Multivitamins', 'multivitamins')
ON CONFLICT (slug) DO NOTHING;

-- Brands
INSERT INTO brands (id, name, slug) VALUES 
('b1000000-0000-0000-0000-000000000000', 'Optimum Nutrition', 'optimum-nutrition'),
('b2000000-0000-0000-0000-000000000000', 'MuscleBlaze', 'muscleblaze'),
('b3000000-0000-0000-0000-000000000000', 'ASITIS NUTRITION', 'asitis-nutrition'),
('b4000000-0000-0000-0000-000000000000', 'MyProtein', 'myprotein')
ON CONFLICT (slug) DO NOTHING;

-- Sellers
INSERT INTO sellers (id, name, slug, is_verified, rating, details) VALUES 
('51000000-0000-0000-0000-000000000000', 'Supplement Nepal Official', 'supplement-nepal', true, 4.9, 'Official store of Supplement Nepal guaranteeing 100% genuine products.'),
('52000000-0000-0000-0000-000000000000', 'Muscle Factory', 'muscle-factory', true, 4.5, 'Authorized distributor for international sports nutrition brands.')
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products (id, category_id, brand_id, seller_id, slug, name, title, original_price, discounted_price, discount_percentage, rating, reviews_count, stock_status, images, highlights) VALUES 
('d1000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'b3000000-0000-0000-0000-000000000000', '51000000-0000-0000-0000-000000000000', 'atom-whey-protein', 'Atom Whey Protein', 'Asitis atom whey protein concentrate - 27g protein 1 bcaa etc', 'RS. 5000', '4290', '20%', 4.3, '24.5K+', 'in_stock', '["https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-2.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-3.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-4.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/protein.jpg"]'::jsonb, '[{"type": "video", "src": "/videos/video-highlight.mp4", "poster": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey.jpg", "alt": "Dynamic video showing supplement texture and mixability"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-2.jpg", "alt": "Detailed nutritional facts and protein content breakdown"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-3.jpg", "alt": "Quality assurance and lab testing certification"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-4.jpg", "alt": "Premium packaging and authentic brand seal"}]'::jsonb),
('d2000000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'b1000000-0000-0000-0000-000000000000', '52000000-0000-0000-0000-000000000000', 'on-gold-standard-whey', 'Gold Standard 100% Whey', 'Optimum Nutrition Gold Standard 100% Whey Protein Powder', 'RS. 6500', '5800', '10%', 4.8, '100K+', 'in_stock', '["https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/protein.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-2.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-3.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-4.jpg"]'::jsonb, '[{"type": "video", "src": "/videos/video-highlight.mp4", "poster": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/protein.jpg", "alt": "Dynamic video showing supplement texture and mixability"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey.jpg", "alt": "Detailed nutritional facts and protein content breakdown"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-2.jpg", "alt": "Quality assurance and lab testing certification"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-3.jpg", "alt": "Premium packaging and authentic brand seal"}]'::jsonb),
('d3000000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'b2000000-0000-0000-0000-000000000000', '51000000-0000-0000-0000-000000000000', 'mb-creatine-monohydrate', 'Creatine Monohydrate', 'MuscleBlaze Creatine Monohydrate, India''s Only Labdoor USA Certified Creatine', 'RS. 1500', '999', '33%', 4.5, '50K+', 'pre_order', '["https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/creatine.png", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-2.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-3.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/protein.jpg"]'::jsonb, '[{"type": "video", "src": "/videos/video-highlight.mp4", "poster": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/creatine.png", "alt": "Dynamic video showing supplement texture and mixability"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey.jpg", "alt": "Detailed nutritional facts and protein content breakdown"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-2.jpg", "alt": "Quality assurance and lab testing certification"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/protein.jpg", "alt": "Premium packaging and authentic brand seal"}]'::jsonb),
('d4000000-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000000', 'b4000000-0000-0000-0000-000000000000', '52000000-0000-0000-0000-000000000000', 'myprotein-alpha-men', 'Alpha Men Multivitamin', 'MyProtein Alpha Men Super Multi Vitamin, 120 Tablets', 'RS. 2500', '1800', '28%', 4.6, '12K+', 'pre_order', '["https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/creatine.png", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-2.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/protein.jpg", "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-4.jpg"]'::jsonb, '[{"type": "video", "src": "/videos/video-highlight.mp4", "poster": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/creatine.png", "alt": "Dynamic video showing supplement texture and mixability"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey.jpg", "alt": "Detailed nutritional facts and protein content breakdown"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/protein.jpg", "alt": "Quality assurance and lab testing certification"}, {"type": "image", "src": "https://agovjcerzpqtajzldsnv.supabase.co/storage/v1/object/public/snp-storage/images/atom-whey-4.jpg", "alt": "Premium packaging and authentic brand seal"}]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Product Info Data
INSERT INTO product_info (id, product_id, description, ingredients_image, other_details) VALUES
(uuid_generate_v4(), 'd1000000-0000-0000-0000-000000000000', 'Information related to the product are as follows...', '/images/ingredients.png', '{"Sales Package": "01 Packet of Protein Powder", "Quantity": "1kg", "Model Name": "Atom Whey", "Form": "Powder", "Country of Origin": "India / Nepal"}'::jsonb),
(uuid_generate_v4(), 'd2000000-0000-0000-0000-000000000000', 'Optimum Nutrition Gold Standard 100% Whey Protein is a high-quality isolate.', '/images/ingredients.png', '{"Sales Package": "1 Tub of Protein Powder", "Quantity": "2kg", "Model Name": "Gold Standard", "Form": "Powder", "Country of Origin": "USA"}'::jsonb),
(uuid_generate_v4(), 'd3000000-0000-0000-0000-000000000000', 'MuscleBlaze Creatine Monohydrate is derived from high quality sources.', '/images/ingredients.png', '{"Sales Package": "1 Jar of Creatine", "Quantity": "250g", "Model Name": "Creatine Monohydrate", "Form": "Powder", "Country of Origin": "India"}'::jsonb),
(uuid_generate_v4(), 'd4000000-0000-0000-0000-000000000000', 'A powerful multi-vitamin containing a specialized blend of essential vitamins.', '/images/ingredients.png', '{"Sales Package": "1 Bottle of Tablets", "Quantity": "120 Tablets", "Model Name": "Alpha Men", "Form": "Tablet", "Country of Origin": "UK"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Product Sizes
INSERT INTO product_sizes (id, product_id, size_label, is_available) VALUES
('e1000000-0000-0000-0000-000000000000', 'd1000000-0000-0000-0000-000000000000', '1kg', true),
('e2000000-0000-0000-0000-000000000000', 'd1000000-0000-0000-0000-000000000000', '2kg', false),
('e3000000-0000-0000-0000-000000000000', 'd2000000-0000-0000-0000-000000000000', '2kg', true),
('e4000000-0000-0000-0000-000000000000', 'd2000000-0000-0000-0000-000000000000', '4kg', true),
('e5000000-0000-0000-0000-000000000000', 'd3000000-0000-0000-0000-000000000000', '100g', true),
('e6000000-0000-0000-0000-000000000000', 'd3000000-0000-0000-0000-000000000000', '250g', false)
ON CONFLICT DO NOTHING;

-- Product Flavours
INSERT INTO product_flavours (id, product_id, flavour_name, image_url, is_available) VALUES
('f1000000-0000-0000-0000-000000000000', 'd1000000-0000-0000-0000-000000000000', 'Vanilla', '/images/vanilla.jpg', false),
('f2000000-0000-0000-0000-000000000000', 'd1000000-0000-0000-0000-000000000000', 'Cream Chocolate Chip', '/images/chocolate.jpg', true),
('f3000000-0000-0000-0000-000000000000', 'd2000000-0000-0000-0000-000000000000', 'Double Rich Chocolate', '/images/chocolate.jpg', true),
('f4000000-0000-0000-0000-000000000000', 'd3000000-0000-0000-0000-000000000000', 'Unflavoured', '/images/magnesium.jpg', true)
ON CONFLICT DO NOTHING;

-- Reviews Data
INSERT INTO reviews (id, product_id, author, role, text, rating, image, is_verified) VALUES
(uuid_generate_v4(), 'd1000000-0000-0000-0000-000000000000', 'Rahul Sharma', 'Verified Buyer', 'Great protein, mixes well and tastes amazing! Saw good results in 2 months.', 5.0, '/images/protein.jpg', true),
(uuid_generate_v4(), 'd1000000-0000-0000-0000-000000000000', 'Priya Patel', 'Verified Buyer', 'Good product but the packaging was slightly damaged when it arrived.', 4.0, null, true),
(uuid_generate_v4(), 'd2000000-0000-0000-0000-000000000000', 'Amit Kumar', 'Fitness Enthusiast', 'Gold standard is always the best. Worth every penny.', 5.0, null, true),
(uuid_generate_v4(), 'd3000000-0000-0000-0000-000000000000', 'Suresh Singh', 'Verified Buyer', 'Very fine powder, dissolves easily in water.', 4.5, null, true);

-- Product QA Data
INSERT INTO product_qa (id, product_id, question, answer, author) VALUES
(uuid_generate_v4(), 'd1000000-0000-0000-0000-000000000000', 'Does this contain a scoop?', 'Yes, a 30g scoop is provided inside the box.', 'Ravi'),
(uuid_generate_v4(), 'd1000000-0000-0000-0000-000000000000', 'Is this vegetarian?', 'Yes, it is 100% vegetarian as it is derived from milk.', 'Vikram'),
(uuid_generate_v4(), 'd2000000-0000-0000-0000-000000000000', 'Can I consume this without working out?', 'While you can consume it to meet daily protein needs, it is best utilized when combined with a workout routine.', 'Anjali'),
(uuid_generate_v4(), 'd3000000-0000-0000-0000-000000000000', 'Should I take it pre or post workout?', 'Creatine can be taken at any time of the day. Consistency is more important than timing.', 'Raj');
