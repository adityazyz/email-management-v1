"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, Settings, Plus, Send, FileText, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useUser,
  useOrganization
} from "@clerk/nextjs";

const Index = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { organization, membership } = useOrganization();
  const router = useRouter();

  const handleViewAdminDetails = () => {
    if (organization?.id) {
      router.push(`/get-admin-data/${organization.id}`);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-indigo-200 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Email Management
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional email management system with role-based access control, 
              attachment support, and workflow management.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center bg-white">
              <CardHeader>
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Send className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Smart Email Composition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create emails with rich text formatting and attachment support
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white">
              <CardHeader>
                <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Admin and Member roles with different permissions and workflows
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white">
              <CardHeader>
                <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Review & Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Structured review process for email approval and management
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Organization Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your organization and view detailed information
          </p>
        </div>

        {/* Organization Data Card */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Organization Name</label>
                <p className="text-lg font-semibold">{organization?.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Organization ID</label>
                <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                  {organization?.id || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Your Role</label>
                <p className="text-lg">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    membership?.roleName === "Admin" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {membership?.roleName || "Member"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-lg">
                  {membership?.createdAt 
                    ? new Date(membership.createdAt).toLocaleDateString() 
                    : "N/A"}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                onClick={handleViewAdminDetails}
                className="flex items-center gap-2"
                size="lg"
              >
                <Eye className="h-4 w-4" />
                View Admin Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Information Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg font-semibold">{user?.fullName || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg">{user?.emailAddresses?.[0]?.emailAddress || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                  {user?.id || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Sign In</label>
                <p className="text-lg">
                  {user?.lastSignInAt 
                    ? new Date(user.lastSignInAt).toLocaleDateString() 
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;