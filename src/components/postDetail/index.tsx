"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  BadgeCheck,
  ArrowLeft,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { authService } from "@/lib/authService";
import { getImageUrl } from "@/lib/config";
import { ImageViewer } from "@/components/imageViewer";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog";

const COMMENT_MAX_LENGTH = 400;

interface Author {
  id: number;
  name: string;
  subtitle?: string;
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

interface Comment {
  id: number;
  content: string;
  authorId: number;
  postId: number;
  createdAt: string;
  images?: string[];
  likeCount: number;
  liked: boolean;
  parentId?: number;
  replies?: Comment[];
  author?: {
    id: number;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

interface Post {
  id: number;
  author: Author;
  progress: string;
  title: string;
  content: string;
  images: string[];
  stats: Stats;
  liked?: boolean;
  createdAt?: string;
}

interface PostDetailProps {
  postId: string;
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  currentUserId: number | null;
  currentUserAvatar: string | null;
  currentUserName: string;
  replyingTo: number | null;
  replyText: string;
  isSubmittingComment: boolean;
  setReplyingTo: (id: number | null) => void;
  setReplyText: (text: string) => void;
  handleLikeComment: (commentId: number, currentlyLiked: boolean) => void;
  handleReply: (parentId: number) => void;
}

const CommentItem = ({
  comment,
  depth = 0,
  currentUserId,
  currentUserAvatar,
  currentUserName,
  replyingTo,
  replyText,
  isSubmittingComment,
  setReplyingTo,
  setReplyText,
  handleLikeComment,
  handleReply,
}: CommentItemProps) => (
  <div className={`flex gap-3 ${depth > 0 ? 'ml-12 mt-3' : 'mb-4'}`}>
    <Avatar className="h-10 w-10 border-2 border-gray-200">
      <AvatarImage 
        src={getImageUrl(comment.author?.avatar)} 
        alt={comment.author?.name || 'User'} 
      />
      <AvatarFallback>{comment.author?.name?.[0] || 'U'}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{comment.author?.name || 'Usuário'}</span>
          {comment.author?.verified && (
            <BadgeCheck className="h-4 w-4" color="#2f89ffff"/>
          )}
        </div>
        <p className="text-sm text-gray-700">{comment.content}</p>
        
        {comment.images && comment.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {comment.images.map((image, index) => (
              <ImageViewer
                key={index}
                images={comment.images!.map((img) => getImageUrl(img))}
                initialIndex={index}
              >
                <div className="relative aspect-video bg-gray-200 rounded overflow-hidden cursor-pointer">
                  <img
                    src={getImageUrl(image)}
                    alt={`Comment image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </ImageViewer>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 mt-1 px-3">
        <button 
          className={`text-xs font-medium flex items-center gap-1 ${
            comment.liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => handleLikeComment(comment.id, comment.liked)}
        >
          <ThumbsUp className={`h-3 w-3 ${
            comment.liked ? 'fill-blue-600' : ''
          }`} />
          {comment.likeCount > 0 ? comment.likeCount : 'Curtir'}
        </button>
        {depth < 2 && (
          <button 
            className="text-xs text-gray-500 hover:text-blue-600"
            onClick={() => {
              setReplyingTo(replyingTo === comment.id ? null : comment.id);
              setReplyText("");
            }}
          >
            {replyingTo === comment.id ? 'Cancelar' : 'Responder'}
          </button>
        )}
        <span className="text-xs text-gray-400">
          {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
      
      {replyingTo === comment.id && (
        <div className="mt-3 flex gap-2 px-3">
          <Avatar className="h-8 w-8 border-2 border-gray-200">
            <AvatarImage 
              src={currentUserAvatar ? getImageUrl(currentUserAvatar) : undefined} 
              alt={currentUserName || "User"} 
            />
            <AvatarFallback className="bg-green-100 text-green-900">
              {currentUserName?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                placeholder={`Respondendo para ${comment.author?.name || 'Usuário'}...`}
                value={replyText}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= COMMENT_MAX_LENGTH) {
                    setReplyText(newValue);
                  }
                }}
                className="min-h-[60px] resize-none text-sm border-green-300 pr-16"
                disabled={isSubmittingComment}
              />
              <div className={`absolute right-3 bottom-3 text-xs font-medium ${
                replyText.length > COMMENT_MAX_LENGTH * 0.9
                  ? 'text-red-500'
                  : replyText.length > COMMENT_MAX_LENGTH * 0.7
                    ? 'text-yellow-500'
                    : 'text-gray-400'
              }`}>
                {replyText.length}/{COMMENT_MAX_LENGTH}
              </div>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 h-auto"
              onClick={() => handleReply(comment.id)}
              disabled={!replyText.trim() || isSubmittingComment}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              currentUserAvatar={currentUserAvatar}
              currentUserName={currentUserName}
              replyingTo={replyingTo}
              replyText={replyText}
              isSubmittingComment={isSubmittingComment}
              setReplyingTo={setReplyingTo}
              setReplyText={setReplyText}
              handleLikeComment={handleLikeComment}
              handleReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

export function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string>("");
  const { showAuthDialog, authMessage, authTitle, setShowAuthDialog, requireAuth } = useAuthDialog();

  const mapCommentDTO = (commentDTO: any): Comment => {
    return {
      ...commentDTO,
      author: {
        id: commentDTO.authorId,
        name: commentDTO.authorName || 'Usuário',
        avatar: commentDTO.authorAvatar,
        verified: false,
      },
      replies: commentDTO.replies ? commentDTO.replies.map(mapCommentDTO) : [],
    };
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUserId(user.id);
          setCurrentUserAvatar(user.avatar || null);
          setCurrentUserName(user.name || "");
        }
      } catch (error) {
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = authService.getToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const url = currentUserId !== null
          ? `/api/posts?userId=${currentUserId}` 
          : '/api/posts';
        
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        const foundPost = data.find((p: any) => p.id === parseInt(postId));
        
        if (foundPost) {
          setPost({
            ...foundPost,
            liked: foundPost.likedByUser === true
          });
          
          try {
            const commentsResponse = await fetch(`/api/comments?postId=${postId}&userId=${currentUserId}`, { headers });
            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json();
              const mappedComments = commentsData.map(mapCommentDTO);
              setComments(mappedComments);
            }
          } catch (error) {
            console.error('Error fetching comments:', error);
          }
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, currentUserId]);

  const handleLike = async () => {
    requireAuth(async () => {
      if (!currentUserId || !post) return;

      setLikingPostId(post.id);

    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (post.liked) {
        const response = await fetch(`/api/likes/posts/${post.id}/likes?userId=${currentUserId}`, {
          method: 'DELETE',
          headers,
        });

        if (response.ok || response.status === 204) {
          setPost({
            ...post,
            liked: false,
            stats: { ...post.stats, likes: post.stats.likes - 1 }
          });
        }
      } else {
        const response = await fetch(`/api/likes/posts/${post.id}/likes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId: currentUserId, postId: post.id }),
        });

        if (response.ok || response.status === 201) {
          setPost({
            ...post,
            liked: true,
            stats: { ...post.stats, likes: post.stats.likes + 1 }
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingPostId(null);
    }
    }, 'curtir');
  };

  const handleLikeComment = async (commentId: number, currentlyLiked: boolean) => {
    requireAuth(async () => {
      if (!currentUserId) return;

      try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const method = currentlyLiked ? "DELETE" : "POST";
      const response = await fetch(
        `/api/comment-likes/comments/${commentId}/likes?userId=${currentUserId}`,
        { method, headers }
      );

      if (response.ok || response.status === 204) {
        const commentsResponse = await fetch(`/api/comments?postId=${postId}&userId=${currentUserId}`, { headers });
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          const mappedComments = commentsData.map(mapCommentDTO);
          setComments(mappedComments);
        }
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
    }, 'curtir');
  };

  const handleReply = async (parentCommentId: number) => {
    requireAuth(async () => {
      if (!currentUserId || !replyText.trim()) return;

      setIsSubmittingComment(true);

    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: replyText.trim(),
          authorId: currentUserId,
          postId: parseInt(postId),
          parentId: parentCommentId,
        }),
      });

      if (response.ok) {
        setReplyText("");
        setReplyingTo(null);
        
        const commentsResponse = await fetch(`/api/comments?postId=${postId}&userId=${currentUserId}`, { headers });
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          const mappedComments = commentsData.map(mapCommentDTO);
          setComments(mappedComments);
        }
        
        if (post) {
          setPost({
            ...post,
            stats: { ...post.stats, comments: post.stats.comments + 1 }
          });
        }
      } else {
        setError('Erro ao enviar resposta. Tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      setError('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setIsSubmittingComment(false);
    }
    }, 'responder');
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    requireAuth(async () => {
      if (!currentUserId || !newComment.trim()) return;

      setIsSubmittingComment(true);

    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: newComment,
          authorId: currentUserId,
          postId: parseInt(postId)
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        
        const mappedComment: Comment = {
          id: newCommentData.id,
          content: newCommentData.content,
          authorId: currentUserId,
          postId: parseInt(postId),
          createdAt: newCommentData.createdAt || new Date().toISOString(),
          images: newCommentData.images || [],
          likeCount: 0,
          liked: false,
          parentId: newCommentData.parentId,
          replies: [],
          author: {
            id: currentUserId,
            name: currentUserName,
            avatar: currentUserAvatar || undefined,
            verified: false,
          }
        };
        
        setComments([mappedComment, ...comments]);
        setNewComment("");
        
        if (post) {
          setPost({
            ...post,
            stats: { ...post.stats, comments: post.stats.comments + 1 }
          });
        }
      } else {
        setError('Erro ao enviar comentário. Tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Erro ao enviar comentário. Tente novamente.');
    } finally {
      setIsSubmittingComment(false);
    }
    }, 'comentar');
  };

  if (isLoading) {
    return (
      <Card className="border-green-200">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!post) {
    return (
      <Card className="border-green-200">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Post não encontrado</p>
          <Button 
            onClick={() => router.push('/home')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Feed
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <Card className="border-green-200">
        <CardContent className="px-6 pb-6 pt-2">
          <Button 
            onClick={() => router.back()} 
            variant="ghost"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-3">
              <Avatar className="h-12 w-12 border-2 border-gray-200">
                <AvatarImage 
                  src={getImageUrl(post.author?.avatar)} 
                  alt={post.author?.name || 'User'} 
                />
                <AvatarFallback>{post.author?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <Link href="/profile/">
                    <span className="font-semibold text-base">{post.author?.name || 'Usuário'}</span>
                  </Link>
                  <span className="text-gray-500">•</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                    {post.author?.title || 'Usuário'}
                  </Button>
                  {post.author?.verified && (
                    <BadgeCheck className="h-5 w-5" color="#2f89ffff"/>
                  )}
                </div>
                <p className="text-sm text-gray-500">{post.author?.subtitle}</p>
                <p className="text-xs text-gray-400">
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : '4d'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {post.progress}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="text-center p-2 border-green-200">
                  <DropdownMenuItem className="justify-center">Ver Perfil</DropdownMenuItem>
                  <DropdownMenuItem className="justify-center text-red-600 font-semibold hover:text-red-600">
                    Reportar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="justify-center">Compartilhar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mb-4">
            {post.title && (
              <h2 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h2>
            )}
            <p className="text-base text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.images.length > 0 && (
            <div className={`grid gap-2 mb-4 ${post.images.length === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {post.images.map((image, index) => (
                <ImageViewer 
                  key={index} 
                  images={post.images.map(img => getImageUrl(img))} 
                  initialIndex={index}
                >
                  <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                    <Image
                      src={getImageUrl(image)}
                      alt={`Image ${index + 1} from post`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </ImageViewer>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 pb-3 border-b">
            <span>{post.stats.likes} curtidas</span>
            <span>{post.stats.comments} comentários</span>
            <span>{post.stats.shares} compartilhamentos</span>
          </div>

          <div className="flex items-center justify-around pb-3 border-b">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-2 transition-colors ${
                post.liked 
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'hover:text-blue-600'
              }`}
              onClick={handleLike}
              disabled={likingPostId === post.id}
            >
              <ThumbsUp 
                className={`h-5 w-5 transition-all ${
                  post.liked ? 'text-blue-600' : ''
                }`} 
              />
              <span className="text-sm">
                {post.liked ? 'Curtido' : 'Curtir'}
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">Comentar</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              <span className="text-sm">Compartilhar</span>
            </Button>
          </div>

          {currentUserId && (
            <form onSubmit={handleSubmitComment} className="mt-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-200">
                  <AvatarImage 
                    src={currentUserAvatar ? getImageUrl(currentUserAvatar) : undefined} 
                    alt={currentUserName || "User"} 
                  />
                  <AvatarFallback className="bg-green-100 text-green-900">
                    {currentUserName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      value={newComment}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue.length <= COMMENT_MAX_LENGTH) {
                          setNewComment(newValue);
                        }
                      }}
                      placeholder="Escreva um comentário..."
                      className="flex-1 min-h-[80px] resize-none pr-16"
                      disabled={isSubmittingComment}
                    />
                    <div className={`absolute right-3 bottom-3 text-xs font-medium ${
                      newComment.length > COMMENT_MAX_LENGTH * 0.9
                        ? 'text-red-500'
                        : newComment.length > COMMENT_MAX_LENGTH * 0.7
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                    }`}>
                      {newComment.length}/{COMMENT_MAX_LENGTH}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Comentários ({comments.filter(c => !c.parentId).length})
          </h3>
          
          {comments.filter(c => !c.parentId).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.filter(c => !c.parentId).map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  currentUserId={currentUserId}
                  currentUserAvatar={currentUserAvatar}
                  currentUserName={currentUserName}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  isSubmittingComment={isSubmittingComment}
                  setReplyingTo={setReplyingTo}
                  setReplyText={setReplyText}
                  handleLikeComment={handleLikeComment}
                  handleReply={handleReply}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title={authTitle}
        message={authMessage}
      />
    </div>
  );
}
