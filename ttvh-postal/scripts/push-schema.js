const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function pushSchema() {
    const connectionString = process.env.SUPABASE_DB_URL;

    if (!connectionString) {
        console.error('Error: SUPABASE_DB_URL is not defined in .env.local');
        console.log('Please add your connection string: postgres://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true');
        process.exit(1);
    }

    const sql = postgres(connectionString, {
        ssl: 'require',
        max: 1, // Single connection for script
    });

    try {
        console.log('🔌 Connecting to Supabase...');

        const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Reading supabase_schema.sql...');

        // Split by semicolons strictly at end of statements might be tricky with SQL functions.
        // Ideally, postgres.js handling of file execution or raw strings is best.
        // But postgres.file() is good if valid. Does specific library support multi-statement?
        // 'postgres' library (porsager/postgres) usually safer with simple file execution if supported,
        // or just execute the whole string if it supports multiple statements.

        console.log('🚀 Pushing schema to database...');
        await sql.unsafe(schemaSql);

        console.log('✅ Schema pushed successfully!');
    } catch (err) {
        console.error('❌ Error pushing schema:', err);
    } finally {
        await sql.end();
    }
}

pushSchema();
