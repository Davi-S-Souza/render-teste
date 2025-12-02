
package com.corrigeaqui.repositories;

import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAuthor(User author);
    List<Post> findByAuthorId(Long authorId);
    List<Post> findByTitleContainingIgnoreCase(String title);
    
}
