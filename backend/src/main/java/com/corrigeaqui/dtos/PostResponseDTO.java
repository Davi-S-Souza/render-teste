package com.corrigeaqui.dtos;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponseDTO(
    Long id,
    String title,
    String content,
    String imageUrl,
    LocalDateTime createdAt,
    AuthorDTO author,
    List<CommentDTO> comments,
    List<LikeDTO> likes,
    List<ReportDTO> reports
) {}
