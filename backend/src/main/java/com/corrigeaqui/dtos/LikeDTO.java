package com.corrigeaqui.dtos;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeDTO {
    private Long id;
    private Long userId;
    private Long postId;
}
