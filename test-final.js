const { Client } = require('pg');

async function testConnections() {
  console.log('TESTING SUPABASE CONNECTIONS');
  console.log('============================');
  
  const connections = [
    {
      name: 'Transaction Pooler (DATABASE_URL - port 6543)',
      string: 'postgresql://postgres.jjehycyurmrzshjquedv:Babawande32%24@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
    },
    {
      name: 'Session Pooler (DIRECT_URL - port 5432)',
      string: 'postgresql://postgres.jjehycyurmrzshjquedv:Babawande32%24@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'
    }
  ];

  for (const conn of connections) {
    console.log(\n[TEST] );
    const maskedString = conn.string.replace(/:[^:@]{1,100}@/, ':*****@');
    console.log(Connection: );
    
    const client = new Client({ connectionString: conn.string });
    
    try {
      console.log('Attempting to connect...');
      await client.connect();
      console.log('SUCCESS! Connected to database');
      
      const res = await client.query('SELECT version()');
      console.log(Database version: ...);
      
      await client.end();
      console.log('Connection closed successfully');
    } catch (err) {
      console.log(FAILED: );
      
      // Specific error troubleshooting
      if (err.message.includes('password')) {
        console.log('  → Password issue: Check if password is correct and properly encoded');
        console.log('  → Your encoded password should be: Babawande32%24');
      } else if (err.message.includes('timeout')) {
        console.log('  → Timeout: Check your network connection');
      } else if (err.message.includes('ECONNREFUSED')) {
        console.log('  → Connection refused: Check if port is correct');
      } else if (err.message.includes('ENOTFOUND')) {
        console.log('  → Host not found: Check the hostname');
      }
    }
  }
}

testConnections();
