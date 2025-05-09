/*
  # Create admin user and role

  1. New Data
    - Creates admin user with specified credentials
    - Assigns admin role to the user
    
  2. Security
    - Uses secure password hashing
    - Sets up proper role assignment
*/

-- First, create the user role if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@semac.com'
  ) THEN
    -- Insert the admin user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@semac.com',
      crypt('SHemac2025@$!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW()
    );

    -- Get the user id we just created
    INSERT INTO user_roles (user_id, role)
    SELECT id, 'admin'
    FROM auth.users
    WHERE email = 'admin@semac.com';
  END IF;
END $$;