import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const result = await prisma.result.create({
    data: {
      ...body,
      status: 'PENDING',
      submittedBy: session.user.id,
    },
  });

  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  const results = await prisma.result.findMany({
    where: { studentId: studentId || undefined },
    orderBy: { submittedAt: 'desc' },
  });

  return NextResponse.json(results);
}