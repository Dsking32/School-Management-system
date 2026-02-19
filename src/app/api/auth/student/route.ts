import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { studentId, dateOfBirth } = await request.json();

    if (!studentId || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Student ID and date of birth are required' },
        { status: 400 }
      );
    }

    // Find student
    const student = await prisma.student.findFirst({
      where: {
        studentId: studentId,
        dateOfBirth: new Date(dateOfBirth),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid student ID or date of birth' },
        { status: 401 }
      );
    }

    // Generate JWT token for session
    const token = jwt.sign(
      {
        id: student.id,
        userId: student.userId,
        role: 'STUDENT',
      },
      process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
      { expiresIn: '1h' }
    );

    // Return student data
    return NextResponse.json({
      token,
      student: {
        id: student.id,
        name: student.user.name,
        studentId: student.studentId,
        dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
        classId: student.classId,
        className: student.class.name,
        arm: student.arm,
      },
    });
  } catch (error) {
    console.error('Student authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}