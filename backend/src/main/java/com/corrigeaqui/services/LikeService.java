package com.corrigeaqui.services;

import com.corrigeaqui.models.Like;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import com.corrigeaqui.repositories.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;

    public Like likePost(User user, Post post) {
        if (likeRepository.existsByUserAndPost(user, post)) {
            return null; 
        }
        Like like = Like.builder().user(user).post(post).build();
        return likeRepository.save(like);
    }

    @Transactional
    public void unlikePost(User user, Post post) {
        likeRepository.deleteByUserAndPost(user, post);
    }

    public long countLikes(Post post) {
        return likeRepository.countByPost(post);
    }
}