package com.corrigeaqui.dtos;

public record UserPublicDTO(
    Long id,
    String name,
    String email,
    String subtitle,
    String avatar,
    boolean verified
) {}
