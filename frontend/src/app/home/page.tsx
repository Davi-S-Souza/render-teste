"use client";

import { SideMenu } from "@/components/sideMenu"
import { Feed } from "@/components/feed"
import { RightSidebar } from "@/components/rightSidebar"
import { useIntroTour } from "@/lib/useIntroTour"
import { SuccessDialog } from "@/components/ui/SuccessDialog"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' })
  
  useEffect(() => {
    if (searchParams.get('postCreated') === 'true') {
      //joguei a mensagem dinamica, da pra fazer mais aqwui se precisar
      setSuccessMessage({
        title: 'Post criado com sucesso!',
        message: 'Sua denúncia foi publicada e já está disponível no feed.'
      })
      setShowSuccessDialog(true)
      window.history.replaceState({}, '', '/home')
    } else if (searchParams.get('registered') === 'success') {
      setSuccessMessage({
        title: 'Conta criada com sucesso!',
        message: 'Obrigado por fazer parte do Corrige Aqui. Agora você já pode enviar suas denúncias e ajudar a transformar nossa comunidade!'
      })
      setShowSuccessDialog(true)
      window.history.replaceState({}, '', '/home')
    }
  }, [searchParams])
  useIntroTour();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SideMenu onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} />
      
      {/* conteudo expande */}
      <div className="md:ml-64 pt-14 md:pt-0">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8" id="main-feed">
              <Feed />
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

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title={successMessage.title}
        message={successMessage.message}
        buttonText="Ok"
      />
    </div>
  )
}