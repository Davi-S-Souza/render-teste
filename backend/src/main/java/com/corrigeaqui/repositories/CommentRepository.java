
package com.corrigeaqui.repositories;

import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByAuthor(User author);
    
    @Query("SELECT c FROM Comment c WHERE c.post = :post AND c.parent IS NULL ORDER BY c.createdAt DESC")
    @EntityGraph(attributePaths = {"author", "replies", "replies.author"})
    List<Comment> findByPostWithAuthor(@Param("post") Post post);
    
    @EntityGraph(attributePaths = {"author"})
    Optional<Comment> findById(Long id);
    
    List<Comment> findByPost(Post post);
    Page<Comment> findByPost(Post post, Pageable pageable);
}
