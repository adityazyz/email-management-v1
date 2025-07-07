import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

// Helper to get user role from Clerk organization membership
async function getUserRole(auth: any) {
  const orgMembership = auth.orgMemberships?.[0];
  if (orgMembership?.role === 'admin') return 'admin';
  return 'member';
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth(req);
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await getUserRole(auth);

  const draft = await prisma.emaildraft.findUnique({ where: { id: params.id } });
  if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (role !== 'admin' && draft.createdById !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(draft);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuth(req);
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await getUserRole(auth);
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { to, subject, body, attachments, status } = await req.json();
  const updated = await prisma.emaildraft.update({
    where: { id: params.id },
    data: { to, subject, body, attachments, status },
  });
  return NextResponse.json(updated);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Admin: send email
  const auth = getAuth(req);
  if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await getUserRole(auth);
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const draft = await prisma.emaildraft.findUnique({ where: { id: params.id } });
  if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (draft.status === 'SENT') return NextResponse.json({ error: 'Already sent' }, { status: 400 });

  // Send email using Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ttuskers@sgtuniversity.org',
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: 'ttuskers@sgtuniversity.org',
      to: draft.to,
      subject: draft.subject,
      text: draft.body,
      // TODO: handle attachments
    });
    await prisma.emaildraft.update({
      where: { id: params.id },
      data: { status: 'SENT', sentAt: new Date(), reviewedById: auth.userId },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send email', details: (e as any).message }, { status: 500 });
  }
} 