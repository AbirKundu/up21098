-- Insert diverse subscription package examples for users to browse
INSERT INTO public.subscription_packages (name, description, price, billing_cycle, currency, features, is_active) VALUES 
-- Video Streaming Service
('StreamFlix Premium', 'Ultra HD streaming with exclusive content, offline downloads, and multi-device support', 899.00, 'monthly', 'BDT', '["Ultra HD 4K streaming", "Download for offline viewing", "Stream on 4 devices simultaneously", "Exclusive original content", "Ad-free experience", "Dolby Atmos sound"]', true),

-- Music Streaming Service  
('TuneWave Premium', 'High-quality music streaming with millions of songs, podcasts, and offline listening', 299.00, 'monthly', 'BDT', '["50+ million songs", "320kbps high-quality audio", "Offline downloads", "No ads", "Unlimited skips", "Podcast access", "Cross-platform sync"]', true),

-- Web Hosting Service
('CloudHost Pro', 'Professional web hosting with SSD storage, SSL certificate, and 24/7 support', 1299.00, 'monthly', 'BDT', '["100GB SSD storage", "Unlimited bandwidth", "Free SSL certificate", "99.9% uptime guarantee", "24/7 technical support", "cPanel access", "Daily backups"]', true),

-- Premium Video Platform
('VideoTube Premium', 'Ad-free videos, background play, and exclusive creator content', 449.00, 'monthly', 'BDT', '["Ad-free viewing", "Background play", "Download videos", "YouTube Music included", "Exclusive premieres", "Picture-in-picture mode"]', true),

-- Cloud Storage Service
('SecureCloud Business', 'Encrypted cloud storage with collaboration tools and advanced sharing', 599.00, 'monthly', 'BDT', '["2TB encrypted storage", "File versioning", "Team collaboration", "Advanced sharing controls", "Mobile & desktop sync", "Priority support"]', true),

-- VPN Service
('PrivateNet VPN', 'Secure internet browsing with global servers and zero-log policy', 349.00, 'monthly', 'BDT', '["100+ global servers", "Zero-log policy", "AES-256 encryption", "Kill switch protection", "5 simultaneous devices", "24/7 support", "High-speed connections"]', true),

-- Design Tools
('DesignStudio Pro', 'Professional design software with templates, fonts, and collaboration features', 1599.00, 'monthly', 'BDT', '["Professional design tools", "10,000+ templates", "Premium fonts library", "Team collaboration", "Cloud sync", "Export in multiple formats", "Priority support"]', true),

-- Productivity Suite
('WorkFlow Premium', 'Complete productivity suite with documents, spreadsheets, and project management', 799.00, 'monthly', 'BDT', '["Document editor", "Spreadsheet tools", "Presentation maker", "Project management", "Team chat", "100GB cloud storage", "Offline access"]', true),

-- Gaming Subscription
('GameVault Ultimate', 'Access to premium games library with exclusive titles and early access', 1199.00, 'monthly', 'BDT', '["200+ premium games", "New releases included", "Early access titles", "Cloud gaming", "Cross-platform saves", "No ads", "Exclusive in-game content"]', true),

-- News & Magazine
('NewsHub Premium', 'Ad-free news from premium publications with personalized content', 199.00, 'monthly', 'BDT', '["Ad-free reading", "100+ premium publications", "Personalized news feed", "Offline reading", "Archive access", "Breaking news alerts", "Dark mode reading"]', true),

-- Food Delivery
('FoodExpress Plus', 'Premium food delivery with free delivery and exclusive restaurant access', 499.00, 'monthly', 'BDT', '["Free delivery on all orders", "Exclusive restaurant partnerships", "Priority delivery", "No surge pricing", "24/7 customer support", "Special member discounts"]', true),

-- Fitness App
('FitTracker Elite', 'Comprehensive fitness tracking with personal coaching and nutrition plans', 649.00, 'monthly', 'BDT', '["Personal workout plans", "Nutrition tracking", "Live coaching sessions", "Progress analytics", "Community challenges", "Wearable device sync", "Meal planning"]', true),

-- Language Learning
('LinguaLearn Pro', 'Advanced language learning with native speaker sessions and certification', 899.00, 'monthly', 'BDT', '["20+ languages available", "Live tutor sessions", "Speech recognition", "Offline lessons", "Progress certification", "Cultural immersion content", "Business language modules"]', true),

-- Photo Storage & Editing
('PhotoVault Pro', 'Unlimited photo storage with advanced editing tools and AI organization', 399.00, 'monthly', 'BDT', '["Unlimited photo storage", "Advanced editing tools", "AI auto-tagging", "Face recognition", "Collaborative albums", "RAW file support", "Mobile & desktop apps"]', true);