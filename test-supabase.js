const { Client } = require('pg');

async function testConnection() {
  const connectionString = 'postgresql://postgres:Babawande32%24@db.jjehycyurmrzshjquedv.supabase.co:6543/postgres?pgbouncer=true&sslmode=require';
  
  console.log('Testing connection to Supabase...');
  console.log('Using Session Pooler (port 6543)');
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ SUCCESS! Connected to Supabase database');
    
    const res = await client.query('SELECT version()');
    console.log('📊 Database version:', res.rows[0].version);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure your password is correct');
    console.log('2. Check if your IP is allowed in Supabase (Authentication → Network Restrictions)');
    console.log('3. Try without SSL: remove ?sslmode=require');
    console.log('4. Check if the pooler is enabled in your Supabase project');
  }
}

testConnection();
