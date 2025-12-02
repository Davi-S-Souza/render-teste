package com.corrigeaqui.repositories;

import com.corrigeaqui.models.Like;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserAndPost(User user, Post post);
    long countByPost(Post post);
    
    @Modifying
    @Transactional
    void deleteByUserAndPost(User user, Post post);
}