
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { getEmailsForUser, getEmailsForAdmin, deleteEmail, sendEmail, rejectEmail, updateEmail } from '@/actions/actions';
import { toast } from "react-toastify";
import axios from "axios";

interface EmailListProps {
  userRole: 'admin' | 'member';
  userId: string;
  organisationId: string;
}

const EmailList = ({ userRole, userId, organisationId }: EmailListProps) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  useEffect(() => {
    async function fetchEmails() {
      setLoading(true);
      try {
        let data;
        if (userRole === 'admin') {
          data = await getEmailsForAdmin({ organisationId });
        } else {
          data = await getEmailsForUser({ userId });
        }
        setEmails(data);
      } catch (error) {
        toast.error('Failed to load emails');
      } finally {
        setLoading(false);
      }
    }
    fetchEmails();
  }, [userRole, userId, organisationId]);

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmail({ id: deleteTarget, userId, userRole });
      setEmails(emails.filter(e => e.id !== deleteTarget));
      toast.success('Email deleted');
    } catch (error) {
      toast.error('Failed to delete email');
    } finally {
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleSend = async (id: string) => {
    try {
      const email = emails.find(e => e.id === id);
      if (!email) throw new Error('Email not found');
      // Prepare FormData for /api/send-email
      const formData = new FormData();
      formData.append('to', email.recipients.join(','));
      formData.append('subject', email.subject);
      formData.append('body', email.body);
      if (email.attachments && email.attachments.length > 0) {
        for (const att of email.attachments) {
          if (att.fileData) {
            // Use fileData (Uint8Array) directly
            const blob = new Blob([att.fileData], { type: att.fileType });
            const file = new File([blob], att.fileName, { type: att.fileType });
            formData.append('attachments', file);
          }
        }
      }
      const response = await axios.post('/api/send-email', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        await sendEmail({ id }); // update status in DB
        setEmails(emails.map(e => e.id === id ? { ...e, status: 'SENT' } : e));
        toast.success('Email sent');
      } else {
        toast.error('Failed to send email: ' + response.data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to send email');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectEmail({ id });
      setEmails(emails.map(e => e.id === id ? { ...e, status: 'REJECTED' } : e));
      toast.success('Email rejected');
    } catch (error) {
      toast.error('Failed to reject email');
    }
  };

  const handleView = (email: any) => {
    setSelectedEmail(email);
    setEditMode(false);
    setEditData(null);
  };

  const handleEdit = (email: any) => {
    setSelectedEmail(email);
    setEditMode(true);
    setEditData({ ...email });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    // Call updateEmail action here
    try {
      // You may want to validate editData fields
      await updateEmail({
        id: editData.id,
        subject: editData.subject,
        body: editData.body,
        recipients: editData.recipients,
        organisationId: editData.organisationId,
        userId,
        userRole
      });
      setEmails(emails.map(e => e.id === editData.id ? { ...e, ...editData } : e));
      toast.success('Email updated');
      setSelectedEmail(null);
      setEditMode(false);
      setEditData(null);
    } catch (error) {
      toast.error('Failed to update email');
    }
  };

  const handleModalClose = () => {
    setSelectedEmail(null);
    setEditMode(false);
    setEditData(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'SENT':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          {userRole === 'admin' ? 'All Emails' : 'My Emails'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : emails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No emails found</p>
            </div>
          ) : (
            emails.map((email) => (
              <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(email.status)}
                      <Badge className={getStatusColor(email.status)}>
                        {email.status.replace('_', ' ')}
                      </Badge>
                      {email.attachments.length > 0 && (
                        <Badge variant="outline">
                          {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {email.subject}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>To: {email.recipients.join(', ')}</p>
                      <p>Ctreated by: {email.createdBy}</p>
                      {/* <p>Created: {new Date(email.createdAt).toLocaleDateString()}</p> */}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(email)}>
                      View
                    </Button>
                    {(userRole === 'admin' || email.createdById === userId) && email.status !== 'SENT' && (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(email)}>
                        Edit
                      </Button>
                    )}
                    {(userRole === 'admin' || email.createdById === userId) && email.status !== 'SENT' && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(email.id)}>
                        Delete
                      </Button>
                    )}
                    {userRole === 'admin' && email.status === 'PENDING_REVIEW' && (
                      <>
                        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => handleSend(email.id)}>
                          Send
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleReject(email.id)}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Modal for view/edit */}
        {selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleModalClose}>&times;</button>
              {editMode ? (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Edit Email</h2>
                  <div className="space-y-2">
                    <input
                      className="w-full border rounded p-2"
                      name="subject"
                      value={editData.subject}
                      onChange={handleEditChange}
                      placeholder="Subject"
                    />
                    <input
                      className="w-full border rounded p-2"
                      name="recipients"
                      value={Array.isArray(editData.recipients) ? editData.recipients.join(', ') : editData.recipients}
                      onChange={e => setEditData({ ...editData, recipients: e.target.value.split(',').map((s: string) => s.trim()) })}
                      placeholder="Recipients (comma separated)"
                    />
                    <textarea
                      className="w-full border rounded p-2 min-h-[100px]"
                      name="body"
                      value={editData.body}
                      onChange={handleEditChange}
                      placeholder="Body"
                    />
                    <div>
                      <strong>Attachments:</strong>
                      <ul className="list-disc ml-6">
                        {editData.attachments && editData.attachments.length > 0 ? (
                          editData.attachments.map((att: any, idx: number) => (
                            <li key={idx}>{att.fileName}</li>
                          ))
                        ) : (
                          <li className="text-gray-400">No attachments</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={handleModalClose}>Cancel</Button>
                    <Button onClick={handleEditSave}>Save</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Email Details</h2>
                  <div className="mb-2"><strong>Subject:</strong> {selectedEmail.subject}</div>
                  <div className="mb-2"><strong>To:</strong> {selectedEmail.recipients.join(', ')}</div>
                  <div className="mb-2"><strong>Body:</strong> <pre className="whitespace-pre-wrap">{selectedEmail.body}</pre></div>
                  <div className="mb-2"><strong>Status:</strong> {selectedEmail.status}</div>
                  <div className="mb-2"><strong>Created By:</strong> {selectedEmail.createdBy}</div>
                  <div className="mb-2"><strong>Created At:</strong> {new Date(selectedEmail.createdAt).toLocaleString()}</div>
                  <div className="mb-2">
                    <strong>Attachments:</strong>
                    <ul className="list-disc ml-6">
                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 ? (
                        selectedEmail.attachments.map((att: any, idx: number) => (
                          <li key={idx}>
                            {att.fileData ? (
                              <a href={URL.createObjectURL(new Blob([att.fileData], { type: att.fileType }))} download={att.fileName}>
                              {att.fileName}
                            </a>
                            ) : (
                              att.fileName
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400">No attachments</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Delete confirmation modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this email?</p>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailList;
