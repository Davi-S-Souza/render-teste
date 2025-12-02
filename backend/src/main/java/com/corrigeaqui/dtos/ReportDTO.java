package com.corrigeaqui.dtos;

import java.time.LocalDateTime;

import com.corrigeaqui.models.enums.ReportStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDTO {
    private Long id;
    private String reason;
    private ReportStatus status;
    private Long userId;
    private Long postId;
    private Long commentId;
    private LocalDateTime createdAt;
    private String resolution;
    private String notes;
}

