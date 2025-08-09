-- Create admin user by updating existing user role
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = '05442e41-5a11-48e6-9e79-3415e9c8a6c4';

-- Ensure profiles table has proper structure for editing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;