"use client";

import { SideMenu } from "@/components/sideMenu"
import { RightSidebar } from "@/components/rightSidebar"
import { Profile } from "@/components/profile"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useState } from "react"

function ProfileContent() {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50">
      <SideMenu onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} />
      
      <div className="md:ml-64">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Profile />
            </div>

            <div className="lg:col-span-4" id="right-sidebar">
              <RightSidebar 
                isOpen={isRightSidebarOpen} 
                onClose={() => setIsRightSidebarOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}