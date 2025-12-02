package com.corrigeaqui.controllers;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.corrigeaqui.dtos.ReportDTO;
import com.corrigeaqui.exceptions.ResourceNotFoundException;
import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.Report;
import com.corrigeaqui.models.User;
import com.corrigeaqui.models.enums.ReportStatus;
import com.corrigeaqui.services.CommentService;
import com.corrigeaqui.services.PostService;
import com.corrigeaqui.services.ReportService;
import com.corrigeaqui.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;
    private final PostService postService;
    private final CommentService commentService;

    @PostMapping("/post")
    public ResponseEntity<ReportDTO> reportPost(@Valid @RequestBody ReportDTO dto) {
        Long userId = dto.getUserId();
        Long postId = dto.getPostId();
        String reason = dto.getReason();
        User reporter = userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Post post = postService.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        Report r = reportService.reportPost(reporter, post, reason);
        ReportDTO response = ReportDTO.builder()
                .id(r.getId())
                .reason(r.getReason())
                .status(r.getStatus())
                .userId(r.getReporter().getId())
                .postId(post.getId())
                .createdAt(r.getCreatedAt())
                .build();
        return ResponseEntity.created(URI.create("/reports/" + r.getId())).body(response);
    }

    @PostMapping("/comment")
    public ResponseEntity<ReportDTO> reportComment(@Valid @RequestBody ReportDTO dto) {
        Long userId = dto.getUserId();
        Long commentId = dto.getCommentId();
        String reason = dto.getReason();
        User reporter = userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Comment comment = commentService.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        Report r = reportService.reportComment(reporter, comment, reason);
        ReportDTO response = ReportDTO.builder()
                .id(r.getId())
                .reason(r.getReason())
                .status(r.getStatus())
                .userId(r.getReporter().getId())
                .commentId(comment.getId())
                .createdAt(r.getCreatedAt())
                .build();
        return ResponseEntity.created(URI.create("/reports/" + r.getId())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ReportDTO>> getAllReports(@RequestParam(required = false) ReportStatus status,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size) {
        List<Report> reports = (status != null) ? reportService.findByStatus(status) : reportService.findAll();
        List<ReportDTO> body = reports.stream().map(r -> ReportDTO.builder()
                .id(r.getId())
                .reason(r.getReason())
                .status(r.getStatus())
                .userId(r.getReporter().getId())
                .postId(r.getPost() != null ? r.getPost().getId() : null)
                .commentId(r.getComment() != null ? r.getComment().getId() : null)
                .createdAt(r.getCreatedAt())
                .resolution(r.getResolution())
                .notes(r.getNotes())
                .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok().header("X-Page", String.valueOf(page)).header("X-Size", String.valueOf(size)).body(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportDTO> getReportById(@PathVariable Long id) {
        Report r = reportService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));
        ReportDTO dto = ReportDTO.builder()
                .id(r.getId())
                .reason(r.getReason())
                .status(r.getStatus())
                .userId(r.getReporter().getId())
                .postId(r.getPost() != null ? r.getPost().getId() : null)
                .commentId(r.getComment() != null ? r.getComment().getId() : null)
                .createdAt(r.getCreatedAt())
                .resolution(r.getResolution())
                .notes(r.getNotes())
                .build();
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ReportDTO> patchReport(@PathVariable Long id, @RequestBody ReportDTO dto) {
        Report existing = reportService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));

        // Update fields if provided
        if (dto.getReason() != null && !dto.getReason().isBlank()) {
            existing.setReason(dto.getReason());
        }
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }
        if (dto.getResolution() != null) {
            existing.setResolution(dto.getResolution());
        }
        if (dto.getNotes() != null) {
            existing.setNotes(dto.getNotes());
        }

        Report updated = reportService.update(existing);
        ReportDTO response = ReportDTO.builder()
            .id(updated.getId())
            .reason(updated.getReason())
            .status(updated.getStatus())
            .userId(updated.getReporter().getId())
            .postId(updated.getPost() != null ? updated.getPost().getId() : null)
            .commentId(updated.getComment() != null ? updated.getComment().getId() : null)
            .createdAt(updated.getCreatedAt())
            .resolution(updated.getResolution())
            .notes(updated.getNotes())
            .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
