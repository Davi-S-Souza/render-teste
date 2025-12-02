package com.corrigeaqui.repositories;

import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class CommentRepositoryTest {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void findByPost_returnsSavedComment() {
        User u = User.builder().name("Alice").email("alice@example.com").password("p").build();
        u = userRepository.save(u);

        Post p = Post.builder().title("T").content("C").author(u).build();
        p = postRepository.save(p);

        Comment c = Comment.builder().content("Nice").author(u).post(p).build();
        c = commentRepository.save(c);

        List<Comment> results = commentRepository.findByPost(p);
        assertThat(results).isNotEmpty();
        assertThat(results).extracting(Comment::getId).contains(c.getId());
    }
}
