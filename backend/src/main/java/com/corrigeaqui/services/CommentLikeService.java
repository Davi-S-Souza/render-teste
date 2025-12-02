package com.corrigeaqui.services;

import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.CommentLike;
import com.corrigeaqui.models.User;
import com.corrigeaqui.repositories.CommentLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentLikeService {

    private final CommentLikeRepository commentLikeRepository;

    @Transactional
    public CommentLike likeComment(User user, Comment comment) {
        if (commentLikeRepository.existsByUserAndComment(user, comment)) {
            return null;
        }
        CommentLike like = CommentLike.builder()
                .user(user)
                .comment(comment)
                .build();
        return commentLikeRepository.save(like);
    }

    @Transactional
    public void unlikeComment(User user, Comment comment) {
        commentLikeRepository.deleteByUserAndComment(user, comment);
    }

    public long getLikeCount(Comment comment) {
        return commentLikeRepository.countByComment(comment);
    }

    public boolean hasUserLiked(User user, Comment comment) {
        return commentLikeRepository.existsByUserAndComment(user, comment);
    }
}
