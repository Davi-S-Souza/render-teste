"use client";

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle, Map, Search, Bell, User, Menu, X, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuthDialog } from "@/hooks/useAuthDialog"
import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog"

interface SideMenuProps {
  onToggleRightSidebar?: () => void;
}

export function SideMenu({ onToggleRightSidebar }: SideMenuProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { showAuthDialog, authMessage, authTitle, setShowAuthDialog, requireAuth } = useAuthDialog()

  const menuItems = [
    { icon: Home, label: "Home", href: "/home", id: "nav-home" },
    { icon: PlusCircle, label: "Novo", href: "/createPost", id: "nav-create" },
    { icon: Map, label: "Mapa", href: "/maps", id: "nav-maps" },
    { icon: Search, label: "Pesquisar", href: "#", id: "search-bar", hidden: true },
    { icon: Bell, label: "Notificação", href: "#", id: "nav-notifications", hidden: true },
  ]

  const isActive = (href: string) => {
    if (href === "#") return false
    return pathname === href
  }

  useEffect(() => {
    if (isOpen) {
      document. body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      <header className={`
        md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-green-200 z-[100] 
        flex items-center justify-between px-4
        transition-transform duration-300 ease-in-out
        ${isOpen ? '-translate-y-full' : 'translate-y-0'}
      `}>
        {/* sidemneu */}
        <button
          onClick={() => setIsOpen(! isOpen)}
          aria-label="Menu"
          className="p-2 text-gray-700 hover:bg-green-50 rounded-md"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link href="/home" className="absolute left-1/2 transform -translate-x-1/2">
          <Image 
            src="/logoatVerde2.png" 
            alt="Corrige Aqui" 
            width={100} 
            height={20} 
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* config */}
        <button
          onClick={onToggleRightSidebar}
          aria-label="Configurações"
          className="p-2 text-gray-700 hover:bg-green-50 rounded-md"
        >
          <Settings/>
        </button>
      </header>

      {/* opacidade fundo */}
      <div 
        className={`
          md:hidden fixed inset-0 bg-black transition-opacity duration-300 z-[90]
          ${isOpen ?  'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* SideMenu */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white border-r border-green-200 flex flex-col
          transition-transform duration-300 ease-in-out z-[95]
          md:translate-x-0 md:z-50
          ${isOpen ?  'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* logoat giga pro max */}
        <div className="p-5 mr-1 border-b border-green-200 flex justify-center items-center">
          <Link href="/home">
            <Image 
              src="/logoatVerde2.png" 
              alt="Corrige Aqui" 
              width={120} 
              height={20} 
              priority
            />
          </Link>
        </div>

        {/* todas opções (feito assim pra qnd tiver o analisarPosts já entrar ai) */}
        <nav className="flex-1 p-4 gap-10">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              if (item.hidden) return null;
              const Icon = item.icon
              const active = isActive(item.href)
              
              const handleClick = (e: React.MouseEvent, href: string) => {
                if (href === '/createPost') {
                  e.preventDefault();
                  requireAuth(() => {
                    setIsOpen(false);
                    router.push('/createPost');
                  }, 'criar post');
                } else {
                  setIsOpen(false);
                }
              };
              
              return (
                <Link 
                  key={item. id} 
                  href={item.href} 
                  id={item.id}
                  onClick={(e) => handleClick(e, item.href)}
                >
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 h-12 text-base ${
                      active 
                        ? "bg-green-600 text-white hover:bg-green-700" 
                        : "text-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-1 hover:border-green-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* profile*/}
        <div className="p-4 border-t border-green-200">
          <Link 
            href="/profile" 
            onClick={() => setIsOpen(false)}
          >
            <Button
              variant={pathname === "/profile" ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-12 text-base ${
                pathname === "/profile"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-1 hover:border-green-300"
              }`}
              id="nav-profile"
            >
              <User className="h-5 w-5" />
              <span>Perfil</span>
            </Button>
          </Link>
        </div>
      </aside>
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title={authTitle}
        message={authMessage}
      />
    </>
  )
}