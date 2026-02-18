import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to import prisma dynamically
    const { prisma } = await import('@/lib/prisma')
    
    // Test the connection - using template literal syntax
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected',
      data: result
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}