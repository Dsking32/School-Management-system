import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID required' },
        { status: 400 }
      );
    }

    // Get results for student
    const results = await prisma.result.findMany({
      where: {
        studentId: studentId,
        status: 'APPROVED', // Only show approved results
      },
      orderBy: [
        { session: 'desc' },
        { term: 'asc' },
      ],
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching student results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}