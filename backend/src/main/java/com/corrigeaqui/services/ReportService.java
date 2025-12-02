package com.corrigeaqui.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.Report;
import com.corrigeaqui.models.User;
import com.corrigeaqui.models.enums.ReportStatus;
import com.corrigeaqui.repositories.ReportRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    public Report reportPost(User reporter, Post post, String reason) {
        Report r = Report.builder()
                .reporter(reporter)
                .post(post)
                .reason(reason)
                .build();
        return reportRepository.save(r);
    }

    public Report reportComment(User reporter, Comment comment, String reason) {
        Report r = Report.builder()
                .reporter(reporter)
                .comment(comment)
                .reason(reason)
                .build();
        return reportRepository.save(r);
    }

    public Optional<Report> findById(Long id) {
        return reportRepository.findById(id);
    }

    public List<Report> findAll() {
        return reportRepository.findAll();
    }

    public List<Report> findByReporter(User reporter) {
        return reportRepository.findByReporter(reporter);
    }

    public List<Report> findByStatus(ReportStatus status) {
        return reportRepository.findByStatus(status);
    }

    public void delete(Long id) {
        reportRepository.deleteById(id);
    }

    public Report update(Report report) {
        return reportRepository.save(report);
    }

    public Report updateStatus(Long id, ReportStatus status) {
        Report r = reportRepository.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("Report not found: " + id));
        r.setStatus(status);
        return reportRepository.save(r);
    }
}
