const postgres = require('postgres');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function seedData() {
  const connectionString = process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.error('Error: SUPABASE_DB_URL is not defined in .env.local');
    process.exit(1);
  }

  const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1,
  });

  try {
    const emails = ['admin@ttvh.vn', 'manager@ttvh.vn', 'leader@ttvh.vn', 'driver@ttvh.vn'];

    console.log('🧹 Cleaning up old data...');
    // 1. Delete profiles linked to these accounts
    await sql`
      DELETE FROM public.profiles 
      WHERE id IN (SELECT id FROM auth.users WHERE email = ANY(${emails}))
    `;
    // 2. Delete identities
    try {
      await sql`
        DELETE FROM auth.identities 
        WHERE identity_data->>'email' = ANY(${emails})
      `;
    } catch (e) {
      console.log('   ⚠️ Could not delete identities (might not exist or no permission):', e.message);
    }
    // 3. Delete users
    await sql`
      DELETE FROM auth.users 
      WHERE email = ANY(${emails})
    `;
    console.log('   ✅ Cleaned up old users.');

    console.log('🌱 Seeding Postal Units...');
    await sql`
      INSERT INTO postal_units (code, name, unit_type, latlng)
      VALUES 
        ('BCVH-840100', 'TTVH Postal Center', 'center', 'POINT(106.0981 11.3135)')
      ON CONFLICT (code) DO UPDATE SET 
        name = EXCLUDED.name, 
        latlng = EXCLUDED.latlng;
    `;

    console.log('🌱 Seeding Auth Users (Admin, Manager, Leader, Driver)...');

    // Enable extensions
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;`;
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;`;

    // Helper to create user
    const createUser = async (email, password, role, fullName, phone, userId) => {
      try {
        console.log(`   👤 Creating ${role}: ${email}...`);

        // 1. Insert into auth.users
        await sql`
          INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
          ) VALUES (
            ${userId}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${email}, 
            crypt(${password}::text, extensions.gen_salt('bf')), NOW(), 
            '{"provider": "email", "providers": ["email"], "unit_code": "BCVH-840100"}'::jsonb, 
            jsonb_build_object('full_name', ${fullName}::text, 'role', ${role}::text), NOW(), NOW(), ${phone}
          )
          ON CONFLICT (id) DO NOTHING;
        `;

        // 2. Insert into auth.identities (CRITICAL FOR LOGIN)
        await sql`
          INSERT INTO auth.identities (
            id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
          ) VALUES (
            ${userId}, ${userId}, format('{"sub": "%s", "email": "%s"}', ${userId}, ${email})::jsonb, 'email', NOW(), NOW(), NOW()
          )
          ON CONFLICT (provider, identity_data) DO NOTHING; 
        `;

        // 3. Insert into public.profiles
        await sql`
          INSERT INTO public.profiles (id, employee_id, full_name, unit_code, unit_type, role, management_level, phone)
          VALUES (
            ${userId}, 
            ${'EMP-' + role.toUpperCase()}, 
            ${fullName}, 
            'BCVH-840100', 
            'center', 
            ${role}, 
            ${role === 'admin' ? 'top' : role === 'manager' ? 'center_lead' : 'team_lead'}, 
            ${phone}
          )
          ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role;
        `;

        console.log(`   ✅ Success: ${email}`);

      } catch (err) {
        console.warn(`   ⚠️ Failed to create ${email}: ${err.message}`);
      }
    };

    // Define Users
    await createUser('admin@ttvh.vn', 'password123', 'admin', 'System Admin', '0909000001', '00000000-0000-0000-0000-000000000001');
    await createUser('manager@ttvh.vn', 'password123', 'manager', 'Postal Manager', '0909000002', '00000000-0000-0000-0000-000000000002');
    await createUser('leader@ttvh.vn', 'password123', 'leader', 'Team Leader', '0909000003', '00000000-0000-0000-0000-000000000003');
    await createUser('driver@ttvh.vn', 'password123', 'shipper', 'Test Shipper', '0909000004', '00000000-0000-0000-0000-000000000004');

    // Seed Routes
    console.log('🌱 Seeding Routes...');
    await sql`
       INSERT INTO routes (route_name, route_path)
       VALUES 
       ('Route A - Center', 'LINESTRING(106.0960 11.3150, 106.1000 11.3150, 106.1000 11.3120)')
    `;

    console.log('✅ Seeding completed!');

  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    await sql.end();
  }
}

seedData();
