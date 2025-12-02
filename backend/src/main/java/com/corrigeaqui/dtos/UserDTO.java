
package com.corrigeaqui.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;

    @jakarta.validation.constraints.NotBlank(message = "name must not be blank")
    private String name;

    @jakarta.validation.constraints.Email(message = "email must be valid")
    @jakarta.validation.constraints.NotBlank(message = "email must not be blank")
    private String email;

    private String password;
    
    private String subtitle;
    
    private String avatar;
    
    private boolean verified;
}
