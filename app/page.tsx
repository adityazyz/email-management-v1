"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, Settings, Plus, Send, FileText } from "lucide-react";
import LoginForm from "../components/auth/LoginForm";
import Dashboard from "../components/dashboard/Dashboard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  useUser, // to access user state
  useOrganization // to access organization state
} from "@clerk/nextjs";

const Index = () => {

   const { isSignedIn, user, isLoaded } = useUser();
   const { membership } = useOrganization();

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
        
        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    );
  }

  if(membership?.organization.slug === "tuskers"){
    return (
      <div className="pt-20">
      <Dashboard userRole={membership?.roleName === "Admin" ? "admin" : "member"} />
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
    )
  }

  return (
<div className="pt-20 flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-indigo-200 p-4">
      <p>This feature is only for Tuskers. If you belong to Tuskers then switch organisation from navbar above.</p>
    </div>
    
  );
};

export default Index;