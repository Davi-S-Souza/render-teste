"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, Send, Image as ImageIcon, X } from "lucide-react";
import { authService } from "@/lib/authService";
import { getImageUrl } from "@/lib/config";
import { ImageViewer } from "@/components/imageViewer";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog";

const COMMENT_MAX_LENGTH = 400;

interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  images?: string[];
  likeCount: number;
  liked: boolean;
  parentId?: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: number;
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  currentUserId: number | null;
  currentUserAvatar: string;
  currentUserName: string;
  replyingTo: number | null;
  replyText: string;
  isSubmitting: boolean;
  setReplyingTo: (id: number | null) => void;
  setReplyText: (text: string) => void;
  handleLikeComment: (commentId: number, currentlyLiked: boolean) => void;
  handleReply: (parentId: number) => void;
  formatDate: (dateString: string) => string;
}

const CommentItem = ({
  comment,
  depth = 0,
  currentUserId,
  currentUserAvatar,
  currentUserName,
  replyingTo,
  replyText,
  isSubmitting,
  setReplyingTo,
  setReplyText,
  handleLikeComment,
  handleReply,
  formatDate,
}: CommentItemProps) => (
  <Card className={`p-4 border-gray-200 ${depth > 0 ? 'ml-12 mt-3' : ''}`}>
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 border-2 border-gray-200">
        <AvatarImage src={getImageUrl(comment.authorAvatar)} />
        <AvatarFallback>
          {comment.authorName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">
            {comment.authorName}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

        {/* imagens */}
        {comment.images && comment.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
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

        {/* acoes */}
        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-auto p-0 text-xs ${
              comment.liked
                ? "text-blue-600 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => handleLikeComment(comment.id, comment.liked)}
          >
            <ThumbsUp
              className={`h-3 w-3 mr-1 ${
                comment.liked ? "fill-blue-600" : ""
              }`}
            />
            {comment.likeCount > 0 ? comment.likeCount : "Curtir"}
          </Button>
          {depth < 2 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-gray-500 hover:text-blue-600"
              onClick={() => {
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyText("");
              }}
            >
              {replyingTo === comment.id ? "Cancelar" : "Responder"}
            </Button>
          )}
        </div>

        {/* botao reply */}
        {replyingTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <Avatar className="h-8 w-8 border-2 border-gray-200">
              <AvatarImage src={getImageUrl(currentUserAvatar)} alt={currentUserName} />
              <AvatarFallback>
                {currentUserName.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder={`Respondendo para ${comment.authorName}...`}
                  value={replyText}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= COMMENT_MAX_LENGTH) {
                      setReplyText(newValue);
                    }
                  }}
                  className="min-h-[60px] resize-none text-sm border-green-300 pr-16"
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
                disabled={!replyText.trim() || isSubmitting}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* replies filhas */}
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
            isSubmitting={isSubmitting}
            setReplyingTo={setReplyingTo}
            setReplyText={setReplyText}
            handleLikeComment={handleLikeComment}
            handleReply={handleReply}
            formatDate={formatDate}
          />
        ))}
      </div>
    )}
  </Card>
);

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const { showAuthDialog, authMessage, authTitle, setShowAuthDialog, requireAuth } = useAuthDialog();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUserId(user.id);
          setCurrentUserAvatar(user.avatar || "/uploads/default-avatar.png");
          setCurrentUserName(user.name || "User");
        }
      } catch (error) {
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = currentUserId 
        ? `/api/comments?postId=${postId}&userId=${currentUserId}`
        : `/api/comments?postId=${postId}`;

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    requireAuth(async () => {
      if (!newComment.trim() || !currentUserId) return;

      setIsSubmitting(true);
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: newComment.trim(),
          authorId: currentUserId,
          postId: postId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Erro ao postar comentário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
    }, 'comentar');
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
        const updateComment = (comment: Comment): Comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              liked: !currentlyLiked,
              likeCount: comment.likeCount + (currentlyLiked ? -1 : 1),
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(updateComment),
            };
          }
          return comment;
        };

        setComments((prevComments) => prevComments.map(updateComment));
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
    }, 'curtir');
  };

  const handleReply = async (parentCommentId: number) => {
    requireAuth(async () => {
      if (!replyText.trim() || !currentUserId) return;

      setIsSubmitting(true);
    try {
      const token = authService.getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: replyText.trim(),
          authorId: currentUserId,
          postId: postId,
          parentId: parentCommentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      setReplyText("");
      setReplyingTo(null);
      await loadComments();
    } catch (error) {
      console.error("Error posting reply:", error);
      setError("Erro ao postar resposta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
    }, 'responder');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {/* comentar botao */}
      <Card className="p-4 border-green-200">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 border-2 border-gray-200">
            <AvatarImage src={getImageUrl(currentUserAvatar)} alt={currentUserName} />
            <AvatarFallback>
              {currentUserName.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="relative">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= COMMENT_MAX_LENGTH) {
                    setNewComment(newValue);
                  }
                }}
                className="min-h-[80px] resize-none border-green-300 pr-16"
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
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                disabled
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Foto
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send className="h-4 w-4 mr-1" />
                {isSubmitting ? "Enviando..." : "Comentar"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* comentarios */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-gray-500 py-4">Carregando comentários...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              currentUserId={currentUserId}
              currentUserAvatar={currentUserAvatar}
              currentUserName={currentUserName}
              replyingTo={replyingTo}
              replyText={replyText}
              isSubmitting={isSubmitting}
              setReplyingTo={setReplyingTo}
              setReplyText={setReplyText}
              handleLikeComment={handleLikeComment}
              handleReply={handleReply}
              formatDate={formatDate}
            />
          ))
        )}
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
