package com.corrigeaqui.dtos;

import java.util.List;

public record FrontPostDTO(
    Long id,
    FrontAuthorDTO author,
    String progress,
    String title,
    String content,
    List<String> images,
    FrontStatsDTO stats,
    Boolean likedByUser
) {}
