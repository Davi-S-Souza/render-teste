"use client";

import { SideMenu } from "@/components/sideMenu"
import { RightSidebar } from "@/components/rightSidebar"
import { PostDetail } from "@/components/postDetail"
import { useState, use } from "react"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-gray-50">
      <SideMenu onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} />
      
      <div className="md:ml-64 pt-14 md:pt-0">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <PostDetail postId={id} />
            </div>
            
            <div className="lg:col-span-4">
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
