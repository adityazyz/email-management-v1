import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, Settings, Plus } from "lucide-react";
import EmailComposer from "./EmailComposer";
import EmailList from "./EmailList";
import { toast } from "sonner";

interface DashboardProps {
  userRole: 'admin' | 'member';
  userId: string;
  userName : string;
  organisationId: string;
}

const Dashboard = ({ userRole, userId,userName, organisationId }: DashboardProps) => {
  const [currentView, setCurrentView] = useState<'emails' | 'compose'>('emails');

  // const handleLogout = () => {
  //   toast.success("Logged out successfully");
  //   onLogout();
  // };

  return (
    <div className="min-h-screen bg-gray-50">


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
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentView === 'emails' && <EmailList userRole={userRole} userId={userId} organisationId={organisationId} />}
          {currentView === 'compose' && <EmailComposer userName={userName} userRole={userRole} userId={userId} organisationId={organisationId} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;