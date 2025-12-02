package com.corrigeaqui.dtos;

import com.corrigeaqui.models.Role;
import com.corrigeaqui.models.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private Long id;
    private String name;
    private String email;
    private String cpf;
    private String phoneNumber;
    private Role role;
    private boolean verified;
    private String avatar;
    private String subtitle;
    private LocalDateTime createdAt;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .cpf(user.getCpf())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .verified(user.isVerified())
                .avatar(user.getAvatar())
                .subtitle(user.getSubtitle())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
