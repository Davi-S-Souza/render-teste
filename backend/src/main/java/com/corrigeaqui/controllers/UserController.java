package com.corrigeaqui.controllers;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.corrigeaqui.dtos.UserDTO;
import com.corrigeaqui.dtos.UserPublicDTO;
import com.corrigeaqui.exceptions.ResourceNotFoundException;
import com.corrigeaqui.models.User;
import com.corrigeaqui.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários")
public class UserController {

    private final UserService userService;

    @Value("${upload.path:uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @GetMapping
    @Operation(summary = "Listar usuários", description = "Retorna lista paginada de usuários")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuários retornada com sucesso")
    })
    public ResponseEntity<List<UserPublicDTO>> getAllUsers(
            @Parameter(description = "Número da página") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamanho da página") @RequestParam(defaultValue = "10") int size) {
    List<UserPublicDTO> list = userService.findAll(page, size)
        .stream()
        .map(u -> new UserPublicDTO(u.getId(), u.getName(), u.getEmail(), u.getSubtitle(), u.getAvatar(), u.isVerified()))
        .collect(Collectors.toList());
    return ResponseEntity.ok()
        .header("X-Page", String.valueOf(page))
        .header("X-Size", String.valueOf(size))
        .body(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuário por ID", description = "Retorna os dados de um usuário específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<UserPublicDTO> getUserById(
            @Parameter(description = "ID do usuário") @PathVariable Long id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return ResponseEntity.ok(new UserPublicDTO(user.getId(), user.getName(), user.getEmail(), user.getSubtitle(), user.getAvatar(), user.isVerified()));
    }

    @PostMapping
    @Operation(summary = "Criar usuário", description = "Registra um novo usuário no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<UserPublicDTO> createUser(@Valid @RequestBody UserDTO dto) {
        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
        User saved = userService.create(user);
        UserPublicDTO response = new UserPublicDTO(saved.getId(), saved.getName(), saved.getEmail(), saved.getSubtitle(), saved.getAvatar(), saved.isVerified());
        return ResponseEntity.created(URI.create("/users/" + saved.getId())).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserPublicDTO> patchUser(@PathVariable Long id, @RequestBody UserDTO dto) {
        User existing = userService.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        
        // Update basic info if provided
        if (dto.getName() != null && !dto.getName().isBlank()) {
            existing.setName(dto.getName());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            // Validate email format when provided
            if (!dto.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().build();
            }
            existing.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            existing.setPassword(dto.getPassword());
        }
        
        // Update additional fields if provided
        if (dto.getSubtitle() != null) {  // Allow empty subtitle
            existing.setSubtitle(dto.getSubtitle());
        }
        if (dto.getAvatar() != null) {  // Allow empty avatar
            existing.setAvatar(dto.getAvatar());
        }
        // Only update verified status if explicitly provided in DTO
        if (dto.isVerified() != existing.isVerified()) {
            existing.setVerified(dto.isVerified());
        }
        
        User updated = userService.update(existing);
        UserPublicDTO response = new UserPublicDTO(updated.getId(), updated.getName(), updated.getEmail(), updated.getSubtitle(), updated.getAvatar(), updated.isVerified());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            // Valida se existe
            User user = userService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

            // Valida arquivo
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest().body("File name is required");
            }

            // ve se cabe no banc o
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body("File size exceeds maximum limit of 10MB");
            }

            // ve extensao 
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
                return ResponseEntity.badRequest().body("Only image files (jpg, jpeg, png, gif) are allowed");
            }

            // cria um "salt" e salve
            String filename = "avatar_user" + id + "_" + UUID.randomUUID() + "." + fileExtension;
            Path path = Paths.get(uploadDir).resolve(filename);

            // Cria o diretório se não existir
            Files.createDirectories(path.getParent());

            // Salva o arquivo
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            // updata o avatar
            String avatarUrl = "/uploads/" + filename;
            user.setAvatar(avatarUrl);
            userService.update(user);

            return ResponseEntity.ok(avatarUrl);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to store avatar: " + e.getMessage());
        }
    }
}
