package com.corrigeaqui.repositories;

import com.corrigeaqui.models.Like;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class LikeRepositoryTest {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void existsByUserAndPost_and_countByPost_work() {
        User u = User.builder().name("Bob").email("bob@example.com").password("p").build();
        u = userRepository.save(u);

        Post p = Post.builder().title("Title").content("C").author(u).build();
        p = postRepository.save(p);

        Like l = Like.builder().user(u).post(p).build();
        l = likeRepository.save(l);

        boolean exists = likeRepository.existsByUserAndPost(u, p);
        long count = likeRepository.countByPost(p);

        assertThat(exists).isTrue();
        assertThat(count).isEqualTo(1L);
    }
}
