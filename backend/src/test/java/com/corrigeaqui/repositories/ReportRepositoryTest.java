package com.corrigeaqui.repositories;

import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.Report;
import com.corrigeaqui.models.User;
import com.corrigeaqui.models.enums.ReportStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class ReportRepositoryTest {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void findByStatus_returnsSavedReport() {
        User reporter = User.builder().name("Reporter").email("rep@example.com").password("pass").build();
        reporter = userRepository.save(reporter);

        Post post = Post.builder().title("Hello").content("content").author(reporter).build();
        post = postRepository.save(post);

        Report r = Report.builder().reason("Spam").reporter(reporter).post(post).status(ReportStatus.PENDING).build();
        r = reportRepository.save(r);

        List<Report> results = reportRepository.findByStatus(ReportStatus.PENDING);
        assertThat(results).isNotEmpty();
        assertThat(results).extracting(Report::getId).contains(r.getId());
    }
}
