"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

//   console.log("Creating post with title:", title, "and content:", content);
  
  try {
    await prisma.post.create({
      data: {
        title,
        slug:title.replace(/\s+/g, '-').toLowerCase(), // simple slug generation
        content,
        published: false, // default to not published
      },
    });
    
    // Revalidate the page to show the new post
    revalidatePath("/posts"); // or whatever your page path is
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

export async function updatePost(formData: FormData, id: string) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    
    try {
        await prisma.post.update({
        where: { id },
        data: {
            title,
            slug: title.replace(/\s+/g, '-').toLowerCase(), // simple slug generation
            content,
        },
        });
        
        // Revalidate the page to show the updated post
        revalidatePath(`/posts/${id}`); // or whatever your page path is
    } catch (error) {
        console.error("Error updating post:", error);
        throw new Error("Failed to update post");
    }
    }

export async function deletePost(id: string) {
    try {
        await prisma.post.delete({
            where: { id },
        });
        
        // Revalidate the page to show the updated post list
        revalidatePath("/posts"); // or whatever your page path is
    } catch (error) {
        console.error("Error deleting post:", error);
        throw new Error("Failed to delete post");
    }
}

// EMAIL SERVER ACTIONS
import { EmailStatus } from '@prisma/client';

export async function createEmail({
  organisationId,
  subject,
  body, 
  recipients,
  attachments,
  status, // optional, for admin override
  createdById,
  createdBy
}: {
  organisationId: string,
  subject: string,
  body: string,
  recipients: string[],
  attachments: { fileName: string, fileType: string, fileUrl: string }[],
  status?: EmailStatus,
  createdById: string,
  createdBy: string 
}) {
  try {
    const email = await prisma.email.create({
      data: {
        organisationId,
        subject,
        body,
        recipients,
        status: status ?? EmailStatus.PENDING_REVIEW,
        createdById,
        createdBy : createdBy,
        attachments: {
          create: attachments
        }
      },
      include: { attachments: true }
    });
    revalidatePath('/dashboard');
    return email;
  } catch (error) {
    console.error('Error creating email:', error);
    throw new Error('Failed to create email');
  }
}

export async function updateEmail({
  id,
  organisationId,
  subject,
  body,
  recipients,
  attachments,
  status,
  userId,
  userRole
}: {
  id: string,
  organisationId?: string,
  subject?: string,
  body?: string,
  recipients?: string[],
  attachments?: { fileName: string, fileType: string, fileUrl: string }[],
  status?: EmailStatus,
  userId: string,
  userRole: 'admin' | 'member'
}) {
  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) throw new Error('Email not found');
  if (userRole !== 'admin' && email.createdById !== userId) throw new Error('Forbidden');
  try {
    const updated = await prisma.email.update({
      where: { id },
      data: {
        organisationId,
        subject,
        body,
        recipients,
        status: userRole === 'admin' ? status : undefined,
        attachments: attachments ? { deleteMany: {}, create: attachments } : undefined
      },
      include: { attachments: true }
    });
    revalidatePath('/dashboard');
    return updated;
  } catch (error) {
    console.error('Error updating email:', error);
    throw new Error('Failed to update email');
  }
}

export async function deleteEmail({ id, userId, userRole }: { id: string, userId: string, userRole: 'admin' | 'member' }) {
  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) throw new Error('Email not found');
  if (userRole !== 'admin' && email.createdById !== userId) throw new Error('Forbidden');
  try {
    await prisma.attachment.deleteMany({ where: { emailId: id } });
    await prisma.email.delete({ where: { id } });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting email:', error);
    throw new Error('Failed to delete email');
  }
}

export async function sendEmail({ id }: { id: string }) {
  // Only admin can send
  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) throw new Error('Email not found');
  try {
    await prisma.email.update({
      where: { id },
      data: { status: EmailStatus.SENT }
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function rejectEmail({ id }: { id: string }) {
  // Only admin can reject
  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) throw new Error('Email not found');
  try {
    await prisma.email.update({
      where: { id },
      data: { status: EmailStatus.REJECTED }
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error rejecting email:', error);
    throw new Error('Failed to reject email');
  }
}

export async function getEmailsForUser({ userId }: { userId: string }) {
  return prisma.email.findMany({
    where: { createdById: userId },
    include: { attachments: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getEmailsForAdmin({ organisationId }: { organisationId: string }) {
  return prisma.email.findMany({
    where: { organisationId },
    include: { attachments: true },
    orderBy: { createdAt: 'desc' }
  });
}