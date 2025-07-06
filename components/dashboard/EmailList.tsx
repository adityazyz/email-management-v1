
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

interface EmailListProps {
  userRole: 'admin' | 'member';
}

// Mock data - replace with actual data from backend
const mockEmails = [
  {
    id: '1',
    to: 'client@example.com',
    subject: 'Monthly Newsletter',
    status: 'pending',
    createdBy: 'john.doe@company.com',
    createdAt: '2024-01-15T10:30:00Z',
    attachments: 2
  },
  {
    id: '2',
    to: 'partner@business.com',
    subject: 'Quarterly Report',
    status: 'approved',
    createdBy: 'jane.smith@company.com',
    createdAt: '2024-01-14T14:20:00Z',
    attachments: 1
  },
  {
    id: '3',
    to: 'team@internal.com',
    subject: 'Team Meeting Notes',
    status: 'sent',
    createdBy: 'admin@company.com',
    createdAt: '2024-01-13T09:15:00Z',
    attachments: 0
  },
  {
    id: '4',
    to: 'customer@service.com',
    subject: 'Product Update',
    status: 'rejected',
    createdBy: 'mike.wilson@company.com',
    createdAt: '2024-01-12T16:45:00Z',
    attachments: 3
  }
];

const EmailList = ({ userRole }: EmailListProps) => {
  const [emails] = useState(mockEmails);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmails = userRole === 'admin' ? emails : emails.filter(email => email.createdBy.includes('john.doe') || email.createdBy.includes('jane.smith'));

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
          {filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No emails found</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(email.status)}
                      <Badge className={getStatusColor(email.status)}>
                        {email.status.toUpperCase()}
                      </Badge>
                      {email.attachments > 0 && (
                        <Badge variant="outline">
                          {email.attachments} attachment{email.attachments > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {email.subject}
                    </h3>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>To: {email.to}</p>
                      <p>From: {email.createdBy}</p>
                      <p>Created: {new Date(email.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {userRole === 'admin' && email.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
      </CardContent>
    </Card>
  );
};

export default EmailList;
