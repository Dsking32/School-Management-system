const { Client } = require('pg');

async function simpleTest() {
  console.log('SIMPLE CONNECTION TEST');
  console.log('======================');
  
  // Test just one connection first
  const connectionString = 'postgresql://postgres.jjehycyurmrzshjquedv:Babawande32%24@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
  
  console.log('Testing Transaction Pooler (port 6543)...');
  console.log('Connection string (password hidden):', connectionString.replace(/:[^:@]{1,100}@/, ':*****@'));
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ CONNECTION SUCCESSFUL!');
    
    const res = await client.query('SELECT current_database() as db, current_user as user');
    console.log('Database:', res.rows[0].db);
    console.log('User:', res.rows[0].user);
    
    await client.end();
    console.log('Connection closed.');
  } catch (err) {
    console.log('✗ CONNECTION FAILED');
    console.log('Error:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify your password is correct');
    console.log('2. Check if $ is encoded as %24 in the password');
    console.log('3. Ensure your IP is allowed in Supabase (Authentication → Network Restrictions)');
    console.log('4. Try connecting from Supabase SQL Editor to verify database is running');
  }
}

simpleTest();
