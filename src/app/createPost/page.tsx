"use client";

import { SideMenu } from "@/components/sideMenu"
import { Post } from "@/components/createPost"
import { RightSidebar } from "@/components/rightSidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useState } from "react"

function CreatePostContent() {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50">
      <SideMenu onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} />
      
      <div className="md:ml-64 pt-14 md:pt-0">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Post />
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

export default function CreatePost() {
  return (
    <ProtectedRoute>
      <CreatePostContent />
    </ProtectedRoute>
  )
}