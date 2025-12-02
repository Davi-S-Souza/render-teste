package com.corrigeaqui.repositories;

import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.CommentLike;
import com.corrigeaqui.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByUserAndComment(User user, Comment comment);
    boolean existsByUserAndComment(User user, Comment comment);
    long countByComment(Comment comment);
    void deleteByUserAndComment(User user, Comment comment);
}
