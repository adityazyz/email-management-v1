import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

// Helper to get user role from Clerk organization membership
async function getUserRole(auth: any) {
  // Clerk's auth object contains orgMemberships
  const orgMembership = auth.orgMemberships?.[0];
  if (orgMembership?.role === 'admin') return 'admin';
  return 'member';
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await getUserRole(auth);

  const { to, subject, body, attachments } = await req.json();
  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const draft = await prisma.emaildraft.create({
    data: {
      to,
      subject,
      body,
      attachments: attachments || [],
      status: role === 'admin' ? 'REVIEW' : 'DRAFT',
      createdBy: { connect: { id: auth.userId } },
    },
  });
  return NextResponse.json(draft);
}

export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await getUserRole(auth);

  let drafts;
  if (role === 'admin') {
    drafts = await prisma.emaildraft.findMany({ orderBy: { createdAt: 'desc' } });
  } else {
    drafts = await prisma.emaildraft.findMany({
      where: { createdById: auth.userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  return NextResponse.json(drafts);
} 