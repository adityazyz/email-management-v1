
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, Users, Settings, Plus } from "lucide-react";
import EmailComposer from "./EmailComposer";
import EmailList from "./EmailList";
import MemberManagement from "./MemberManagement";
import { toast } from "sonner";

interface DashboardProps {
  userRole: 'admin' | 'member';
  onLogout: () => void;
}

const Dashboard = ({ userRole, onLogout }: DashboardProps) => {
  const [currentView, setCurrentView] = useState<'emails' | 'compose' | 'members'>('emails');

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Email Guardian</h1>
                <p className="text-sm text-gray-500 capitalize">{userRole} Dashboard</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex space-x-1 p-1">
            <Button
              variant={currentView === 'emails' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('emails')}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Emails
            </Button>
            <Button
              variant={currentView === 'compose' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('compose')}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
            {userRole === 'admin' && (
              <Button
                variant={currentView === 'members' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('members')}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Members
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentView === 'emails' && <EmailList userRole={userRole} />}
          {currentView === 'compose' && <EmailComposer userRole={userRole} />}
          {currentView === 'members' && userRole === 'admin' && <MemberManagement />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
