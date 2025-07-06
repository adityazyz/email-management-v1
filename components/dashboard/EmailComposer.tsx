
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Save } from "lucide-react";
import { toast } from "sonner";

interface EmailComposerProps {
  userRole: 'admin' | 'member';
}

const EmailComposer = ({ userRole }: EmailComposerProps) => {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    body: "",
    attachments: [] as File[]
  });

  const handleSubmit = (action: 'send' | 'submit') => {
    if (!emailData.to || !emailData.subject || !emailData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (userRole === 'admin') {
      toast.success("Email sent successfully!");
    } else {
      toast.success("Email submitted for admin review!");
    }

    // Reset form
    setEmailData({
      to: "",
      subject: "",
      body: "",
      attachments: []
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEmailData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
    toast.success(`${files.length} file(s) attached`);
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
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
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
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
              />
            </div>
            
            {emailData.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Attached files:</p>
                {emailData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
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
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit('send')}>
            <Send className="h-4 w-4 mr-2" />
            {userRole === 'admin' ? 'Send Email' : 'Submit for Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailComposer;
