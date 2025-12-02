package com.corrigeaqui.services;

import com.corrigeaqui.dtos.LoginRequest;
import com.corrigeaqui.dtos.LoginResponse;
import com.corrigeaqui.dtos.RegisterRequest;
import com.corrigeaqui.dtos.UserResponse;
import com.corrigeaqui.models.Role;
import com.corrigeaqui.models.User;
import com.corrigeaqui.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Senhas não correspondem");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já registrado");
        }

        if (userRepository.existsByCpf(request.getCpf())) {
            throw new IllegalArgumentException("CPF já registrado");
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .cpf(request.getCpf())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .verified(false)
                .build();

        user = userRepository.save(user);

        return UserResponse.fromUser(user);
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou senha inválidos"));

        var jwtToken = jwtService.generateToken(user);

        return new LoginResponse(jwtToken, UserResponse.fromUser(user));
    }

    public UserResponse getCurrentUser(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        
        return UserResponse.fromUser(user);
    }
}
