"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MessageCircle, Repeat2, Share2, MoreHorizontal, BadgeCheck } from "lucide-react"
import { getImageUrl } from "@/lib/config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CirclePlus } from "lucide-react";
import { authService } from "@/lib/authService";
import { ImageViewer } from "@/components/imageViewer";
import { CommentSection } from "@/components/commentSection";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog";

interface Author {
  name: string;
  subtitle: string;
  verified: boolean;
  avatar: string;
  title?: string; 
}

interface Stats {
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
}

interface Post {
  id: number;
  author: Author;
  progress: string;
  title: string;
  content: string;
  images: string[];
  stats: Stats;
  badge?: string; 
  additionalText?: string; 
  hashtags?: string; 
  reactions?: string;
  liked?: boolean;
  showComments?: boolean;
}

const mapPostResponse = (post: any): Post => ({
  ...post,
  badge: post.progress,
  reactions: `${post.stats.likes} pessoas curtiram esse post`,
  liked: false,
  showComments: false
});

export function Feed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { showAuthDialog, authMessage, authTitle, setShowAuthDialog, requireAuth } = useAuthDialog();
  
  // Carrega o usuário atual
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
      }
    };
    loadUser();

    const fetchPosts = async () => {
      try {
        const token = authService.getToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const user = await authService.getCurrentUser().catch(() => null);
        const url = user ? `/api/posts?userId=${user.id}` : '/api/posts';
        
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        
        const postsWithLikeStatus = data.map((post: any) => ({
          ...post,
          badge: post.progress,
          reactions: `${post.stats.likes} pessoas curtiram esse post`,
          liked: post.likedByUser === true
        }));
        
        setPosts(postsWithLikeStatus);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId: number) => {
    requireAuth(async () => {
      if (!currentUserId) return;
      
      setLikingPostId(postId);
    
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Adiciona o token JWT se existir
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (post.liked) {
        // Unlike - DELETE request
        const response = await fetch(`/api/likes/posts/${postId}/likes?userId=${currentUserId}`, {
          method: 'DELETE',
          headers,
        });

        if (response.ok || response.status === 204) {
          setPosts(prevPosts =>
            prevPosts.map(p =>
              p.id === postId
                ? {
                    ...p,
                    liked: false,
                    stats: { ...p.stats, likes: p.stats.likes - 1 },
                    reactions: `${p.stats.likes - 1} pessoas curtiram esse post`
                  }
                : p
            )
          );
        } else {
          console.error('Erro ao descurtir:', response.status);
        }
      } else {
        // Like - POST request
        const response = await fetch(`/api/likes/posts/${postId}/likes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId: currentUserId, postId }),
        });

        if (response.ok || response.status === 201) {
          setPosts(prevPosts =>
            prevPosts.map(p =>
              p.id === postId
                ? {
                    ...p,
                    liked: true,
                    stats: { ...p.stats, likes: p.stats.likes + 1 },
                    reactions: `${p.stats.likes + 1} pessoas curtiram esse post`
                  }
                : p
            )
          );
        } else if (response.status === 409) {
          setPosts(prevPosts =>
            prevPosts.map(p =>
              p.id === postId ? { ...p, liked: true } : p
            )
          );
        } else if (response.status === 403) {
          console.error('Acesso negado. Faça login novamente.');
          authService.logout();
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingPostId(null);
    }
    }, 'curtir');
  };

  const toggleComments = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, showComments: !p.showComments } : p
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Card Fixo - Criar Post */}
      <Card className="border-green-200 py-5">
        <CardContent className="p-6">
          <div className="flex gap-3 justify-center items-center">
            <div className="flex flex-col gap-5 text-gray-700">
              <p className="flex-1 text-center mr-auto ml-auto font-[700] px-4 py-2 bg-gray-100 rounded-full transition-colors">
                BORA CORRIGIR AQUI!
              </p>
              <button
                className="flex items-center gap-2 px-4 py-2 text-green-100 bg-green-200 hover:bg-green-300 rounded-full text-green-800 text-sm transition-colors"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  requireAuth(() => router.push('/createPost'), 'criar post');
                }}
              >
                Viu alguma anomalia na sua cidade? Compartilhe com todos!
                <CirclePlus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.map((post) => (
        <Card key={post.id} className="border-green-200 cursor-pointer hover:shadow-md transition-shadow">
          {  <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div 
                className="flex gap-3 flex-1"
                onClick={() => router.push(`/post/${post.id}`)}
              >
                <Avatar className="h-10 w-10 border-2 border-gray-200">
                  <AvatarImage src={getImageUrl(post.author.avatar)} alt={post.author.name} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {post.title && (
                    <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">
                      {post.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <Link href="/profile/" onClick={(e) => e.stopPropagation()}>
                      <span className="font-medium text-gray-600 hover:text-gray-900">
                        {post.author.name}
                      </span>
                    </Link>
                    {post.author.verified && (
                      <BadgeCheck className="h-3 w-3" color="#2f89ffff"/>
                    )}
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{post.author.subtitle}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">4d</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {post.badge}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="text-center p-2 border-green-200">
                    <DropdownMenuItem className="justify-center">Ver Perfil</DropdownMenuItem>
                    <DropdownMenuItem className="justify-center text-red-600 font-semibold hover:text-red-600">Reportar</DropdownMenuItem>
                    <DropdownMenuItem className="justify-center">Compartilhar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Post Content */}
            <div 
              className="mb-4"
              onClick={() => router.push(`/post/${post.id}`)}
            >
              <p className="text-sm text-gray-700 mb-2 break-all">{post.content}</p>
              {post.additionalText && (
                <p className="text-sm text-gray-700 mb-2 break-all">{post.additionalText}</p>
              )}
              {post.hashtags && (
                <p className="text-sm text-blue-600">{post.hashtags}</p>
              )}
            </div>

            {/* Post Images */}
              {post.images.length > 0 && (
              <div 
                className={`grid gap-2 mb-4 ${post.images.length === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}
              >
                {post.images.map((image, index) => (
                  <ImageViewer 
                    key={index} 
                    images={post.images.map(img => getImageUrl(img))} 
                    initialIndex={index}
                  >
                    <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={getImageUrl(image)}
                        alt={`Image ${index + 1} from ${post.author.name}'s post`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </ImageViewer>
                ))}
              </div>
            )}            {/* Post Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b">
              <span>{post.reactions}</span>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-around" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-2 transition-colors ${
                  post.liked 
                    ? 'text-blue-600 hover:text-blue-700' 
                    : 'hover:text-blue-600'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(post.id);
                }}
                disabled={likingPostId === post.id}
              >
                <ThumbsUp 
                  className={`h-4 w-4 transition-all ${
                    post.liked ? 'text-blue-600' : ''
                  }`} 
                />
                <span className="text-xs hidden md:block">
                  {post.liked ? 'Curtido' : 'Likes'}
                </span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComments(post.id);
                }}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs hidden md:block">
                  {post.showComments ? 'Ocultar' : 'Comentários'} ({post.stats.comments})
                </span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Repeat2 className="h-4 w-4" />
                <span className="text-xs hidden md:block">Repostar</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span className="text-xs hidden md:block">Compartilhar</span>
              </Button>
            </div>

            {post.showComments && (
              <div className="mt-4 pt-4 border-t">
                <CommentSection postId={post.id} />
              </div>
            )}
          </CardContent>}
        </Card>
      ))}
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title={authTitle}
        message={authMessage}
      />
    </div>
  );
}