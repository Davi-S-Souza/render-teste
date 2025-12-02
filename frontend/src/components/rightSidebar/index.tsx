"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, HelpCircle, X } from "lucide-react"
import Link from "next/link"
import { restartTour } from "@/lib/useIntroTour"
import { useState, useEffect } from "react"
import { Badge } from "lucide-react";
import { ChevronUp } from "lucide-react";
import { authService } from "@/lib/authService";
import { useRouter } from "next/navigation";

const followSuggestion = {
  name: "IFSChat",
  subtitle: "Chat? Apenas um! IFSChat.",
  avatar: "/avatars/abc.png"
}
  
const topUsers = [
  {
    name: "Robert Lox",
    title: "Seguir",
    subtitle: "Chief Executive Officer, Roblox, Inc",
    rank: 1,
    medal: "🥇"
  },
  {
    name: "Linus Torvalds",
    title: "Meu P...",
    subtitle: "Desenvolvedor Júnior",
    rank: 2,
    medal: "🥈"
  },
  {
    name: "Ifson Chatton",
    title: "Seguir",
    subtitle: "Empresário, Chad",
    rank: 3,
    medal: "🥉"
  }
]

const statusConfig = [
  {
    name: "Em Análise",
    color: "bg-purple-100 text-purple-800",
  },
  {
    name: "Em Revisão",
    color: "bg-blue-100 text-blue-700",

  },
  {
    name: "Em Andamento",
    color: "bg-yellow-100 text-yellow-800",
  }
]

interface RightSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function RightSidebar({ isOpen = true, onClose }: RightSidebarProps = {}) {
  const router = useRouter()
  const [isPostsExpanded, setIsPostsExpanded] = useState(true)
  const [expandedStatus, setExpandedStatus] = useState<string[]>([])
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return;
    
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUserId(user.id);
          setCurrentUserName(user.name);
        }
      } catch (error) {
        setCurrentUserId(null);
        setCurrentUserName(null);
      }
    };
    loadUser();
  }, [isMounted]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!currentUserName || !isMounted) {
        setIsLoading(false);
        return;
      }

      try {
        const token = authService.getToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/posts`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch user posts');
        }
        const data = await response.json();
        const filteredPosts = data.filter((post: any) => post.author?.name === currentUserName);
        console.log('User posts found:', filteredPosts.length, 'Total posts:', data.length);
        setUserPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
        setUserPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [currentUserName, isMounted]);

  const statusCounts = statusConfig.map(statusItem => {
    const postsInStatus = userPosts.filter((post: any) => post.progress === statusItem.name)
    return {
      ...statusItem,
      count: postsInStatus.length,
      posts: postsInStatus
    }
  }).filter(item => item.count > 0)

  const totalActivePosts = userPosts.length

  const toggleStatus = (statusName: string) => {
    setExpandedStatus(prev => 
      prev.includes(statusName) 
        ? prev.filter(s => s !== statusName)
        : [...prev, statusName]
    )
  }

  return (
    <>
      {/* Overlay Mobile */}
      <div 
        className={`
          lg:hidden fixed inset-0 bg-black transition-opacity duration-300 z-[80]
          ${isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div 
        id="infoAdicional"
        className={`
          lg:space-y-4 lg:sticky lg:z-5
          fixed right-0 top-0 h-screen w-80 bg-gray-50 overflow-y-auto p-4 space-y-4
          transition-transform duration-300 ease-in-out z-[85]
          lg:translate-x-0 lg:h-auto lg:w-auto lg:fixed-none lg:bg-transparent lg:p-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Botão Fechar - Apenas Mobile */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Informações Adicionais</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-md"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* botao tour */}
        <Card className="border-green-200">
          <CardContent className="p-4">
            <Button 
              onClick={restartTour}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Ver Tour da Plataforma
            </Button>
          </CardContent>
        </Card>

        {/* meus posts */}
        {isMounted && currentUserId && (
          <Card className="border-green-200">
            <CardContent className="p-3">
              <div 
                className="flex items-center justify-center cursor-pointer"
                onClick={() => setIsPostsExpanded(!isPostsExpanded)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Meus Posts</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 rounded-2xl h-5 text-xs">
                    {totalActivePosts}
                  </Badge>
                </div>
                {isPostsExpanded ? (
                  <ChevronUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-green-600" />
                )}
              </div>

              {/* status aberto */}
              {isPostsExpanded && (
                <div className="mt-3 space-y-2">
                  {isLoading ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Carregando...
                    </p>
                  ) : statusCounts.length > 0 ? (
                    statusCounts.map((statusItem, index) => (
                      <div 
                        key={index}
                        className="border border-gray-200 rounded-lg hover:border-green-300 transition-all"
                      >
                        <div 
                          className="flex items-center justify-between p-2 cursor-pointer hover:bg-green-50"
                          onClick={() => toggleStatus(statusItem.name)}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusItem.color}`}>
                              {statusItem.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">{statusItem.count} / {totalActivePosts}</span>
                            {expandedStatus.includes(statusItem.name) ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {expandedStatus.includes(statusItem.name) && (
                          <div className="px-2 pb-2 space-y-1">
                            {statusItem.posts.map((post: any) => (
                              <div
                                key={post.id}
                                className="p-2 text-xs text-gray-700 hover:bg-gray-100 rounded cursor-pointer truncate"
                                onClick={() => router.push(`/post/${post.id}`)}
                                title={post.title}
                              >
                                {post.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum post ativo no momento
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Follow Suggestion */}
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Ad</span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <span className="text-gray-400">•••</span>
              </Button>
            </div>
            
            <p className="text-xs text-gray-600 mb-4">
              Siga para todas as novidades!
            </p>

            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-20 w-20 mb-3 bg-white rounded-full border-2 border-gray-200">
                <AvatarFallback className="bg-white-800 text-white text-2xl">
                  <img src="/ifschat.png" alt="IFSChat" width="50px" height="50px"/>
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold">{followSuggestion.name}</p>
              <p className="text-xs text-gray-500 text-center mt-1">
                {followSuggestion.subtitle}
              </p>
            </div>

            <Button className="w-full hover:bg-green-50 hover:text-green-600 hover:border-1 hover:border-green-300" variant="outline" size="sm">
              Saiba Mais!
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}