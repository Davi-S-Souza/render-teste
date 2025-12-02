"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/authService";
import type { User } from "@/@types/user";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog";

type Author = {
  name: string;
  subtitle?: string;
  verified?: boolean;
  avatar?: string;
  title?: string;
};

type Stats = {
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
};

type Post = {
  id: number;
  author: Author;
  progress?: string;
  title?: string;
  content: string;
  images: string[];
  stats?: Stats;
  reactions?: string;
};

export function Profile() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showAuthDialog, authMessage, authTitle, setShowAuthDialog, requireAuth } = useAuthDialog();

  useEffect(() => {
    async function load() {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);

        const token = authService.getToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch("/api/posts", { headers });
        if (!res.ok) {
          throw new Error("Failed to load posts");
        }
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error(err);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [router]);

  const postsByUser = currentUser ? posts.filter((p) => p.author?.name === currentUser.name) : [];
  const postsCount = postsByUser.length;

  const joinedMonths = currentUser?.createdAt 
    ? Math.floor((new Date().getTime() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-green-200">
        <CardContent className="p-8">
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 bg-white border-2 mb-10 border-green-300">
                <AvatarFallback className="text-xl bg-green-100 text-green-900 font-semibold">
                    {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                {currentUser?.name || "Carregando..."}
                {currentUser?.verified && (
                  <Badge className="bg-green-100 text-green-700 border-0 inline-flex items-center gap-1">
                    <BadgeCheck className="h-10 w-10 text-green-600" />
                  </Badge>
                )}
              </h1>
            </div>

            <p className="text-sm text-gray-500 mt-2 text-center">
              {currentUser?.email || ""} • {currentUser?.role || "USER"}
            </p>

            <div className="w-full max-w-3xl mt-6 border-t" />

            <div className="w-full max-w-3xl mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">{postsCount}</div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl font-bold text-gray-800">4.8</div>
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="text-xs text-gray-500">Avaliação</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-gray-800">{joinedMonths}</div>
                <div className="text-xs text-gray-500">Meses</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action row */}
      <div className="flex gap-3">
        <Button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={(e) => {
            e.preventDefault();
            requireAuth(() => router.push('/createPost'), 'criar post');
          }}
        >
          Criar novo post
        </Button>
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="border-red-300 hover:border-red-500 text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {isLoading && (
          <Card className="border-green-200">
            <CardContent className="p-6 text-center text-sm text-gray-500">
              Carregando posts...
            </CardContent>
          </Card>
        )}

        {!isLoading && posts.length === 0 && (
          <Card className="border-green-200">
            <CardContent className="p-6 text-center text-sm text-gray-500">
              Nenhum post encontrado.
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          postsByUser.map((post) => (
            <Card key={post.id} className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    {post.author?.avatar ? (
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    ) : (
                      <AvatarFallback>{post.author?.name?.[0] ?? "U"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{post.author?.name}</span>
                      {post.author?.verified && (
                        <Badge className="bg-green-100 text-green-700 inline-flex items-center gap-1">
                          <BadgeCheck className="h-4 w-4 text-green-600" />
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400 ml-2">• 4d</span>
                      {post.progress && (
                        <Badge className="ml-auto bg-blue-100 text-blue-700">{post.progress}</Badge>
                      )}
                    </div>
                    {post.author?.subtitle && (
                      <p className="text-xs text-gray-500">{post.author.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">{post.content}</p>

                  {post.images && post.images.length > 0 && (
                    <div className={`grid gap-2 mb-2 ${post.images.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
                      {post.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={img.startsWith("http") ? img : `${window.location.protocol}//${window.location.hostname}:8080${img}`}
                            alt={`post image ${idx + 1}`}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-t pt-3">
                  <span>{post.reactions ?? ""}</span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">Likes</Button>
                    <Button variant="ghost" size="sm">Comentários</Button>
                    <Button variant="ghost" size="sm">Compartilhar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title={authTitle}
        message={authMessage}
      />
    </div>
  );
}