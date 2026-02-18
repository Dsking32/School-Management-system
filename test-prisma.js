const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('=== PRISMA CONSTRUCTOR TEST ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'undefined');

const tests = [
  { name: 'No options', config: undefined },
  { name: 'datasourceUrl', config: { datasourceUrl: process.env.DATABASE_URL } },
  { name: 'datasources', config: { datasources: { db: { url: process.env.DATABASE_URL } } } }
];

async function runTests() {
  for (const test of tests) {
    console.log('\n[TEST] ' + test.name);
    try {
      const prisma = new PrismaClient(test.config);
      console.log('SUCCESS with ' + test.name);
      
      try {
        await prisma.$connect();
        console.log('Database connection successful');
        await prisma.$disconnect();
        return; // Exit after first success
      } catch (connErr) {
        console.log('Database connection failed:', connErr.message);
      }
    } catch (e) {
      console.log('Failed with ' + test.name + ':', e.message);
    }
  }
}

runTests();