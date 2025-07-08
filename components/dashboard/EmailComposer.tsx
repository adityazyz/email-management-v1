import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Save } from "lucide-react";
import { toast } from "react-toastify";
import { createEmail } from '@/actions/actions';
import axios from "axios";

interface EmailComposerProps { 
  userRole: 'admin' | 'member';
  userId: string;
  userName: string;
  organisationId: string;
}

const EmailComposer = ({ userRole, userId, userName, organisationId }: EmailComposerProps) => {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    body: "",
    attachments: [] as File[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (action: 'send' | 'submit') => {
    if (!emailData.to || !emailData.subject || !emailData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      if (userRole === 'admin' && action === 'send') {
        // create email entry for review
        // Member: create email entry for review
        const attachmentsMeta = emailData.attachments.map(file => ({
          fileName: file.name,
          fileType: file.type,
          fileUrl: `/uploads/${file.name}` // Placeholder
        }));
        await createEmail({
          subject: emailData.subject,
          body: emailData.body,
          recipients: emailData.to.split(',').map(s => s.trim()),
          attachments: attachmentsMeta,
          organisationId,
          status: 'SENT',
          createdById: userId,
          createdBy: userName
        });
        toast.success("Email entry created!");
        setEmailData({ to: "", subject: "", body: "", attachments: [] });

        // Admin: send email directly via /api/send-email
        const formData = new FormData();
        formData.append('to', emailData.to);
        formData.append('subject', emailData.subject);
        formData.append('body', emailData.body);
        emailData.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
        const response = await axios.post('/api/send-email', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success("Email sent successfully!");
          setEmailData({ to: "", subject: "", body: "", attachments: [] });
        } else {
          toast.error("Failed to send email: " + response.data.error);
        }
      } else {
        // Member: create email entry for review
        const attachmentsMeta = emailData.attachments.map(file => ({
          fileName: file.name,
          fileType: file.type,
          fileUrl: `/uploads/${file.name}` // Placeholder
        }));
        await createEmail({
          subject: emailData.subject,
          body: emailData.body,
          recipients: emailData.to.split(',').map(s => s.trim()),
          attachments: attachmentsMeta,
          organisationId,
    createdBy: userName,
          createdById: userId
        });
        toast.success("Email submitted for admin review!");
        setEmailData({ to: "", subject: "", body: "", attachments: [] });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check file size (limit to 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setEmailData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
      toast.success(`${validFiles.length} file(s) attached`);
    }
  };

  const removeAttachment = (index: number) => {
    setEmailData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Compose Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="to">To *</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={emailData.to}
              onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              placeholder="Compose your email message..."
              className="min-h-[200px]"
              value={emailData.body}
              onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </div>
            
            {emailData.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Attached files:</p>
                {emailData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('submit')}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSubmit('send')} 
            disabled={isLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : (userRole === 'admin' ? 'Send Email' : 'Submit for Review')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailComposer;