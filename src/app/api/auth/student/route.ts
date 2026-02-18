import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { studentId, dateOfBirth } = await request.json();

    const student = await prisma.student.findFirst({
      where: {
        studentId,
        dateOfBirth: new Date(dateOfBirth),
      },
      include: {
        user: true,
        class: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: student.id, userId: student.userId, role: 'STUDENT' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      token,
      student: {
        id: student.id,
        name: student.user.name,
        studentId: student.studentId,
        class: student.class.name,
        arm: student.arm,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}