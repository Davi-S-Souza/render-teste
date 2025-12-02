package com.corrigeaqui.dtos;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private LocalDateTime createdAt;
    private List<String> images;
    private String progress;
    private Integer reposts;
    private Integer shares;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private Double latitude;
    private Double longitude;
}
