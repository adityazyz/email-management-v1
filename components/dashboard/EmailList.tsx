import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, XCircle, Eye, Download, Trash2 } from "lucide-react";
import { getEmailsForUser, getEmailsForAdmin, deleteEmail, sendEmail, rejectEmail, updateEmail } from '@/actions/actions';
import { toast } from "react-toastify";
import axios from "axios";
import React from "react";

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
  const [sendTarget, setSendTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

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

  const confirmSend = async () => {
    if (!sendTarget) return;
    await handleSend(sendTarget);
    setSendTarget(null);
  };
  const cancelSend = () => setSendTarget(null);
  const confirmReject = async () => {
    if (!rejectTarget) return;
    await handleReject(rejectTarget);
    setRejectTarget(null);
  };
  const cancelReject = () => setRejectTarget(null);

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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Subject and meta info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
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
                    <h3 className="font-semibold text-gray-900 mb-1 text-lg break-words">
                      {email.subject}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><span className="font-medium text-gray-800">To:</span> <span className="break-all">{email.recipients.join(', ')}</span></div>
                      <div><span className="font-medium text-gray-800">Created by:</span> {email.createdBy}</div>
                    </div>
                  </div>
                  {/* Right: Action buttons */}
                  <div className="flex flex-wrap gap-2 justify-start md:justify-end md:items-start md:w-auto w-full">
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
                        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => setSendTarget(email.id)}>
                          Send
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setRejectTarget(email.id)}>
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative border border-gray-200">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-3xl font-bold p-2 focus:outline-none" onClick={handleModalClose}>&times;</button>
              {editMode ? (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Edit Email</h2>
                  <div className="space-y-4">
                    <input
                      className="w-full border rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-200"
                      name="subject"
                      value={editData.subject}
                      onChange={handleEditChange}
                      placeholder="Subject"
                    />
                    <input
                      className="w-full border rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-200"
                      name="recipients"
                      value={Array.isArray(editData.recipients) ? editData.recipients.join(', ') : editData.recipients}
                      onChange={e => setEditData({ ...editData, recipients: e.target.value.split(',').map((s: string) => s.trim()) })}
                      placeholder="Recipients (comma separated)"
                    />
                    <textarea
                      className="w-full border rounded-lg p-3 min-h-[120px] text-base focus:ring-2 focus:ring-blue-200"
                      name="body"
                      value={editData.body}
                      onChange={handleEditChange}
                      placeholder="Body"
                    />
                    <div>
                      <strong className="block mb-2 text-gray-800">Attachments:</strong>
                      <ul className="list-none bg-gray-50 rounded-lg p-3 space-y-2">
                        {editData.attachments && editData.attachments.length > 0 ? (
                          editData.attachments.map((att: any, idx: number) => {
                            const blob = att.fileData ? new Blob([att.fileData], { type: att.fileType }) : null;
                            const url = blob ? URL.createObjectURL(blob) : null;
                            return (
                              <li key={idx} className="flex items-center gap-2 text-gray-700">
                                <span className="truncate max-w-[160px]">{att.fileName}</span>
                                {url && (
                                  <>
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                      <Button variant="outline" size="sm" className="px-2 py-1 text-xs flex items-center gap-1"><Eye className="w-3 h-3" />View</Button>
                                    </a>
                                    <a href={url} download={att.fileName}>
                                      <Button variant="outline" size="sm" className="px-2 py-1 text-xs flex items-center gap-1"><Download className="w-3 h-3" />Download</Button>
                                    </a>
                                  </>
                                )}
                                <Button variant="ghost" size="sm" className="px-2 py-1 text-xs text-red-600 flex items-center gap-1" onClick={() => {
                                  setEditData((prev: any) => ({
                                    ...prev,
                                    attachments: prev.attachments.filter((_: any, i: number) => i !== idx)
                                  }));
                                }}><Trash2 className="w-3 h-3" />Remove</Button>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-gray-400">No attachments</li>
                        )}
                      </ul>
                      <div className="mt-3">
                        <input
                          type="file"
                          multiple
                          className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            const newAttachments = await Promise.all(files.map(async (file) => {
                              const arrayBuffer = await file.arrayBuffer();
                              const fileData = new Uint8Array(arrayBuffer);
                              return {
                                fileName: file.name,
                                fileType: file.type,
                                fileData
                              };
                            }));
                            setEditData((prev: any) => ({
                              ...prev,
                              attachments: [...prev.attachments, ...newAttachments]
                            }));
                            e.target.value = '';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-8 border-t pt-4">
                    <Button variant="outline" onClick={handleModalClose}>Cancel</Button>
                    <Button onClick={handleEditSave} className="bg-blue-600 text-white hover:bg-blue-700">Save</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">Email Details</h2>
                  <div className="mb-4">
                    <div className="mb-2"><strong>Subject:</strong> <span className="text-gray-800">{selectedEmail.subject}</span></div>
                    <div className="mb-2"><strong>To:</strong> <span className="text-gray-800">{selectedEmail.recipients.join(', ')}</span></div>
                    <div className="mb-2"><strong>Body:</strong> <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 rounded p-2 mt-1">{selectedEmail.body}</pre></div>
                    <div className="mb-2"><strong>Status:</strong> <span className="text-gray-800">{selectedEmail.status}</span></div>
                    <div className="mb-2"><strong>Created By:</strong> <span className="text-gray-800">{selectedEmail.createdBy}</span></div>
                    <div className="mb-2"><strong>Created At:</strong> <span className="text-gray-800">{new Date(selectedEmail.createdAt).toLocaleString()}</span></div>
                  </div>
                  <div className="mb-2">
                    <strong>Attachments:</strong>
                    <ul className="list-disc ml-6">
                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 ? (
                        selectedEmail.attachments.map((att: any, idx: number) => {
                          const blob = att.fileData ? new Blob([att.fileData], { type: att.fileType }) : null;
                          const url = blob ? URL.createObjectURL(blob) : null;
                          return (
                            <li key={idx} className="flex items-center gap-2">
                              <span>{att.fileName}</span>
                              {url && (
                                <>
                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="px-2 py-1 text-xs">View</Button>
                                  </a>
                                  <a href={url} download={att.fileName}>
                                    <Button variant="outline" size="sm" className="px-2 py-1 text-xs">Download</Button>
                                  </a>
                                </>
                              )}
                            </li>
                          );
                        })
                      ) : (
                        <li className="text-gray-400">No attachments</li>
                      )}
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={handleModalClose}>Close</Button>
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

        {/* Send confirmation modal */}
        {sendTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
              <h2 className="text-lg font-semibold mb-4">Confirm Send</h2>
              <p>Are you sure you want to send this email?</p>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={cancelSend}>Cancel</Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={confirmSend}>Send</Button>
              </div>
            </div>
          </div>
        )}

        {/* Reject confirmation modal */}
        {rejectTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
              <h2 className="text-lg font-semibold mb-4">Confirm Reject</h2>
              <p>Are you sure you want to reject this email?</p>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={cancelReject}>Cancel</Button>
                <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmReject}>Reject</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailList;