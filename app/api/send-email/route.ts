// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;
    const attachmentFiles = formData.getAll('attachments') as File[];

    console.log("Attachment files received:", attachmentFiles);

    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ID, // Store your Gmail ID in environment variables
        pass: process.env.GMAIL_APP_PASSWORD // Store your app password in environment variables
      }
    });

    // Process attachments
    const attachments = [];
    for (const file of attachmentFiles) {
      if (file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create a unique filename to avoid conflicts
        const filename = `${uuidv4()}_${file.name}`;
        const filepath = path.join(process.cwd(), 'temp', filename);
        
        // You might want to save to a temp directory or use the buffer directly
        // For now, we'll use the buffer directly in the attachment
        attachments.push({
          filename: file.name,
          content: buffer,
          contentType: file.type || 'application/octet-stream'
        });
      }
    }

    // Email options
    const mailOptions = {
      from: {
        name: 'Tuskers Society',
        address: process.env.GMAIL_ID || "" // Use your Gmail ID as the sender
      },
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Tuskers</h2>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Official Communication</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${subject}</h3>
              <div style="white-space: pre-wrap; line-height: 1.6;">${body}</div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">Best regards,<br>Team Tuskers,<br> SGT University</p>
             
            </div>
          </div>
        </div>
      `,
      attachments: attachments
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      },
      { status: 500 }
    );
  }
}

// Optional: Add a simple GET method for testing
// export async function GET() {
//   return NextResponse.json({ 
//     message: 'Email API endpoint is working',
//     timestamp: new Date().toISOString()
//   });
// }