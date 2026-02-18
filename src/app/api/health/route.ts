import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'API is working',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }
  })
}
