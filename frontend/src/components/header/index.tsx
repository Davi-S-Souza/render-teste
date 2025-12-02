"use client";

import { Search, Home, Bell, Map, CirclePlus, Users, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthDialog } from "@/hooks/useAuthDialog"
import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog"

export function Header() {
  const router = useRouter();
  const { showAuthDialog, authMessage, authTitle, setShowAuthDialog, requireAuth } = useAuthDialog();

  const handleCreatePost = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => router.push('/createPost'), 'criar post');
  };
  return (
    <header className="bg-white border-b sticky top-0 z-50 border-green-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home/">
            <div className="flex items-center gap-2">
                <Image src="/logoatVerde.png" alt="IFSChat" width="100" height="100" priority/>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Procurar"
                className="pl-10 w-full border-green-200"
              />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-6">
            <Link href="/home/" id="nav-home">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                <Home className="h-5 w-5 text-green-600" />
                <span className="text-xs text-green-600">Home</span>
              </Button>            
            </Link>
            
            <Link href="/maps/" id="nav-maps">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                <Map className="h-5 w-5 text-green-600" />
                <span className="text-xs text-green-600">Mapa</span>
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={handleCreatePost}
              id="nav-create"
            >
              <CirclePlus className="h-5 w-5 text-green-600" />
              <span className="text-xs text-green-600">Novo</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2" id="nav-notifications">
              <Bell className="h-5 w-5 text-green-600" />
              <span className="text-xs text-green-600">Notificação</span>
            </Button>
            
            <Link href="/profile/" id="nav-profile">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-xs text-green-600">Eu</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-green-600">Site Oficial</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-green-200">
                <DropdownMenuItem>Ir para site oficial</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-sm text-green-600">Teste Premium Grátis!</span>
              <Button size="sm" variant="outline" className="border-green-200">
                Alto Contraste: Claro
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title={authTitle}
        message={authMessage}
      />
    </header>
  )
}