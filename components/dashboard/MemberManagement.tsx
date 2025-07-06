
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Mock data - replace with actual data from backend
const mockMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'member',
    status: 'active',
    emailsSent: 12,
    joinedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'member',
    status: 'active',
    emailsSent: 8,
    joinedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    role: 'member',
    status: 'inactive',
    emailsSent: 3,
    joinedAt: '2024-01-10T00:00:00Z'
  }
];

const MemberManagement = () => {
  const [members] = useState(mockMembers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = () => {
    toast.success("Add member functionality would open a form here");
  };

  const handleEditMember = (memberId: string) => {
    toast.success(`Edit member ${memberId} functionality would open a form here`);
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    toast.success(`Delete member ${memberName} functionality would be implemented here`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Member Management
          </CardTitle>
          <Button onClick={handleAddMember}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members List */}
          <div className="space-y-4">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No members found</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <Badge 
                          className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {member.status}
                        </Badge>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Email: {member.email}</p>
                        <p>Emails Sent: {member.emailsSent}</p>
                        <p>Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditMember(member.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberManagement;
