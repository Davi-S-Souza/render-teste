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
public class CommentDTO {
    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private String authorAvatar;
    private Long postId;
    private Long parentId;
    private LocalDateTime createdAt;
    private List<String> images;
    private Long likeCount;
    private Boolean liked;
    private List<CommentDTO> replies;
}
