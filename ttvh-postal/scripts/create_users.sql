-- RUN THIS SCRIPT IN SUPABASE DASHBOARD -> SQL EDITOR

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 2. Create Users Helper Block
DO $$
DECLARE
  new_id uuid;
BEGIN
  -- =================================================================
  -- ADMIN ACCOUNT (admin@ttvh.vn / password123)
  -- =================================================================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@ttvh.vn') THEN
    new_id := uuid_generate_v4();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@ttvh.vn', 
      crypt('password123', extensions.gen_salt('bf')), NOW(), 
      '{"provider": "email", "providers": ["email"], "unit_code": "BCVH-840100"}'::jsonb, 
      '{"full_name": "System Admin", "role": "admin"}'::jsonb, NOW(), NOW(), '0909000001'
    );

    -- Insert into auth.identities (REQUIRED for login)
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_id, new_id, format('{"sub": "%s", "email": "admin@ttvh.vn"}', new_id)::jsonb, 'email', NOW(), NOW(), NOW()
    );

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, employee_id, full_name, unit_code, unit_type, role, management_level, phone)
    VALUES (new_id, 'ADM-001', 'System Admin', 'BCVH-840100', 'headquarters', 'admin', 'top', '0909000001');
    
    RAISE NOTICE 'Created Admin User';
  END IF;

  -- =================================================================
  -- MANAGER ACCOUNT (manager@ttvh.vn / password123)
  -- =================================================================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@ttvh.vn') THEN
    new_id := uuid_generate_v4();
    
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@ttvh.vn', 
      crypt('password123', extensions.gen_salt('bf')), NOW(), 
      '{"provider": "email", "providers": ["email"], "unit_code": "BCVH-840100"}'::jsonb, 
      '{"full_name": "Postal Manager", "role": "manager"}'::jsonb, NOW(), NOW(), '0909000002'
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_id, new_id, format('{"sub": "%s", "email": "manager@ttvh.vn"}', new_id)::jsonb, 'email', NOW(), NOW(), NOW()
    );

    INSERT INTO public.profiles (id, employee_id, full_name, unit_code, unit_type, role, management_level, phone)
    VALUES (new_id, 'MGR-001', 'Postal Manager', 'BCVH-840100', 'center', 'manager', 'center_lead', '0909000002');
    
    RAISE NOTICE 'Created Manager User';
  END IF;

  -- =================================================================
  -- LEADER ACCOUNT (leader@ttvh.vn / password123)
  -- =================================================================
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'leader@ttvh.vn') THEN
    new_id := uuid_generate_v4();
    
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      new_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'leader@ttvh.vn', 
      crypt('password123', extensions.gen_salt('bf')), NOW(), 
      '{"provider": "email", "providers": ["email"], "unit_code": "BCVH-840100"}'::jsonb, 
      '{"full_name": "Team Leader", "role": "leader"}'::jsonb, NOW(), NOW(), '0909000003'
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_id, new_id, format('{"sub": "%s", "email": "leader@ttvh.vn"}', new_id)::jsonb, 'email', NOW(), NOW(), NOW()
    );

    INSERT INTO public.profiles (id, employee_id, full_name, unit_code, unit_type, role, management_level, phone)
    VALUES (new_id, 'LDR-001', 'Team Leader', 'BCVH-840100', 'center', 'leader', 'team_lead', '0909000003');
    
    RAISE NOTICE 'Created Leader User';
  END IF;

END $$;
