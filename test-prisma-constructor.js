const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

console.log('=== PRISMA CONSTRUCTOR TEST ===')
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'undefined')

const tests = [
  { name: 'No options', config: undefined },
  { name: 'datasourceUrl', config: { datasourceUrl: process.env.DATABASE_URL } },
  { name: 'datasources', config: { datasources: { db: { url: process.env.DATABASE_URL } } } }
]

for (const test of tests) {
  try {
    console.log(\n[TEST] )
    const prisma = new PrismaClient(test.config)
    console.log(✓ SUCCESS with )
    
    // Test connection
    prisma.().then(() => {
      console.log(✓ Database connection successful)
      prisma.()
    }).catch(err => {
      console.log(✗ Database connection failed:, err.message)
    })
    
    break
  } catch (e) {
    console.log(✗ Failed with :, e.message)
  }
}
