import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const arm = searchParams.get('arm');

  const students = await prisma.student.findMany({
    where: {
      ...(classId && { classId }),
      ...(arm && { arm }),
    },
    include: { user: true, class: true },
  });

  return NextResponse.json(students);
}