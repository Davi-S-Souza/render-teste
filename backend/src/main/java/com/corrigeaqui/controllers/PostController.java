package com.corrigeaqui.controllers;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

import com.corrigeaqui.dtos.FrontAuthorDTO;
import com.corrigeaqui.dtos.FrontPostDTO;
import com.corrigeaqui.dtos.FrontStatsDTO;
import com.corrigeaqui.dtos.MapMarkerDTO;
import com.corrigeaqui.dtos.PostDTO;
import com.corrigeaqui.exceptions.ResourceNotFoundException;
import com.corrigeaqui.models.Category;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import com.corrigeaqui.repositories.LikeRepository;
import com.corrigeaqui.services.CategoryService;
import com.corrigeaqui.services.PostService;
import com.corrigeaqui.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Endpoints para gerenciamento de denúncias/postagens")
public class PostController {

        private final PostService postService;
        private final UserService userService;
        private final CategoryService categoryService;
        private final LikeRepository likeRepository;

        @Value("${upload.path:uploads}")
        private String uploadDir;

        private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
        private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        
        private List<String> toFullImageUrls(List<String> images) {
                if (images == null || images.isEmpty()) {
                        return List.of();
                }
                return images;
        }

        @GetMapping
        @Operation(summary = "Listar feed de denúncias", description = "Retorna lista paginada de denúncias ordenadas por data de criação")
        @ApiResponses(value = {
                @ApiResponse(responseCode = "200", description = "Feed retornado com sucesso",
                        content = @Content(mediaType = "application/json", schema = @Schema(implementation = FrontPostDTO.class)))
        })
        public ResponseEntity<List<FrontPostDTO>> getFeed(
                        @Parameter(description = "Número da página") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Tamanho da página") @RequestParam(defaultValue = "10") int size,
                        @Parameter(description = "ID do usuário atual (para verificar likes)") @RequestParam(required = false) Long userId) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                Page<Post> posts = postService.findAll(pageable);
                
                User currentUser = null;
                if (userId != null) {
                        currentUser = userService.findById(userId).orElse(null);
                }
                
                final User finalCurrentUser = currentUser;
                List<FrontPostDTO> response = posts.stream().map(post -> {
                                
                                FrontAuthorDTO author = new FrontAuthorDTO(
                                                post.getAuthor() != null ? post.getAuthor().getName() : "",
                                                post.getAuthor() != null ? post.getAuthor().getSubtitle() : "",
                                                post.getAuthor() != null ? post.getAuthor().isVerified() : false,
                                                post.getAuthor() != null && post.getAuthor().getAvatar() != null
                                                                ? post.getAuthor().getAvatar()
                                                                : (post.getAuthor() != null
                                                                                ? "/avatars/user" + post.getAuthor().getId() + ".jpg"
                                                                                : "/avatars/default.jpg"));

                                
                                java.util.List<String> images = post.getImages() != null && !post.getImages().isEmpty()
                                                ? post.getImages()
                                                : (post.getImageUrl() != null
                                                                ? java.util.List.of(post.getImageUrl())
                                                                : java.util.List.of());

                                FrontStatsDTO stats = new FrontStatsDTO(
                                                post.getLikes() != null ? post.getLikes().size() : 0,
                                                post.getComments() != null ? post.getComments().size() : 0,
                                                post.getReposts() != null ? post.getReposts() : 0,
                                                post.getShares() != null ? post.getShares() : 0
                                );

                                // Check if current user liked this post
                                Boolean likedByUser = null;
                                if (finalCurrentUser != null) {
                                        likedByUser = likeRepository.existsByUserAndPost(finalCurrentUser, post);
                                }

                                return new FrontPostDTO(
                                                post.getId(),
                                                author,
                                                post.getProgress() != null ? post.getProgress() : "Em Revisão",
                                                post.getTitle(),
                                                post.getContent(),
                                                images,
                                                stats,
                                                likedByUser);
                        }).toList();

                return ResponseEntity.ok()
                        .header("X-Page", String.valueOf(page))
                        .header("X-Size", String.valueOf(size))
                        .header("X-Total-Elements", String.valueOf(posts.getTotalElements()))
                        .header("X-Total-Pages", String.valueOf(posts.getTotalPages()))
                        .body(response);
        }

        @PostMapping
        @Operation(summary = "Criar nova denúncia", description = "Registra uma nova denúncia de problema urbano")
        @ApiResponses(value = {
                @ApiResponse(responseCode = "201", description = "Denúncia criada com sucesso"),
                @ApiResponse(responseCode = "400", description = "Dados inválidos"),
                @ApiResponse(responseCode = "404", description = "Usuário ou categoria não encontrado")
        })
        public ResponseEntity<PostDTO> createPost(@Valid @RequestBody PostDTO dto) {
                User author = userService.findById(dto.getAuthorId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found: " + dto.getAuthorId()));
                        
                        Category category = null;
                        if (dto.getCategoryId() != null) {
                                category = categoryService.findById(dto.getCategoryId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found: " + dto.getCategoryId()));
                        }
                        
                        Post post = Post.builder()
                                        .title(dto.getTitle())
                                        .content(dto.getContent())
                                        .author(author)
                                        .category(category)
                                        .latitude(dto.getLatitude())
                                        .longitude(dto.getLongitude())
                                        .build();
                        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
                                post.setImages(dto.getImages());
                                post.setImageUrl(dto.getImages().get(0));
                        }
                Post saved = postService.create(post);
                PostDTO response = PostDTO.builder()
                                .id(saved.getId())
                                .title(saved.getTitle())
                                .content(saved.getContent())
                                .authorId(saved.getAuthor().getId())
                                .createdAt(saved.getCreatedAt())
                                .images(saved.getImages() != null && !saved.getImages().isEmpty() ? saved.getImages() : (saved.getImageUrl() != null ? List.of(saved.getImageUrl()) : List.of()))
                                .progress(saved.getProgress())
                                .reposts(saved.getReposts())
                                .shares(saved.getShares())
                                .categoryId(saved.getCategory() != null ? saved.getCategory().getId() : null)
                                .categoryName(saved.getCategory() != null ? saved.getCategory().getName() : null)
                                .categoryColor(saved.getCategory() != null ? saved.getCategory().getColor() : null)
                                .latitude(saved.getLatitude())
                                .longitude(saved.getLongitude())
                                .build();
                return ResponseEntity.created(URI.create("/posts/" + saved.getId())).body(response);
        }

        @GetMapping("/{id}")
        public ResponseEntity<PostDTO> getPostById(@PathVariable Long id) {
                Post post = postService.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
                PostDTO dto = PostDTO.builder()
                                .id(post.getId())
                                .title(post.getTitle())
                                .content(post.getContent())
                                .authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                                .createdAt(post.getCreatedAt())
                                .images(post.getImages())
                                .progress(post.getProgress())
                                .reposts(post.getReposts())
                                .shares(post.getShares())
                                .build();
                return ResponseEntity.ok(dto);
        }

        @PatchMapping("/{id}")
        @Operation(summary = "Atualizar denúncia", description = "Atualiza parcialmente os dados de uma denúncia existente")
        @ApiResponses(value = {
                @ApiResponse(responseCode = "200", description = "Denúncia atualizada com sucesso"),
                @ApiResponse(responseCode = "404", description = "Denúncia não encontrada")
        })
        public ResponseEntity<PostDTO> patchPost(
                @Parameter(description = "ID da denúncia") @PathVariable Long id, 
                @RequestBody PostDTO dto) {
                Post existing = postService.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
                
                if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
                    existing.setTitle(dto.getTitle());
                }
                if (dto.getContent() != null && !dto.getContent().isBlank()) {
                    existing.setContent(dto.getContent());
                }
                if (dto.getImages() != null) {
                    existing.setImages(dto.getImages());
                }
                if (dto.getProgress() != null) {
                    existing.setProgress(dto.getProgress());
                }
                if (dto.getCategoryId() != null) {
                    Category category = categoryService.findById(dto.getCategoryId())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Category not found: " + dto.getCategoryId()));
                    existing.setCategory(category);
                }
                                if (dto.getLatitude() != null) {
                                        existing.setLatitude(dto.getLatitude());
                                }
                                if (dto.getLongitude() != null) {
                                        existing.setLongitude(dto.getLongitude());
                                }
                
                Post updated = postService.update(existing);
                PostDTO response = PostDTO.builder()
                                .id(updated.getId())
                                .title(updated.getTitle())
                                .content(updated.getContent())
                                .authorId(updated.getAuthor() != null ? updated.getAuthor().getId() : null)
                                .createdAt(updated.getCreatedAt())
                                .images(updated.getImages())
                                .progress(updated.getProgress())
                                .categoryId(updated.getCategory() != null ? updated.getCategory().getId() : null)
                                .categoryName(updated.getCategory() != null ? updated.getCategory().getName() : null)
                                .categoryColor(updated.getCategory() != null ? updated.getCategory().getColor() : null)
                                                                .latitude(updated.getLatitude())
                                                                .longitude(updated.getLongitude())
                                .reposts(updated.getReposts())
                                .shares(updated.getShares())
                                .build();
                return ResponseEntity.ok(response);
        }

                @GetMapping("/markers")
                @Operation(summary = "Obter marcadores do mapa", description = "Retorna todas as denúncias com coordenadas para exibição no mapa")
                @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Marcadores retornados com sucesso")
                })
                public ResponseEntity<List<MapMarkerDTO>> getMarkers() {
                                List<Post> posts = postService.findAll();
                                List<MapMarkerDTO> markers = posts.stream()
                                                .filter(p -> p.getLatitude() != null && p.getLongitude() != null)
                                                .map(p -> {
                                                        List<String> images = p.getImages() != null && !p.getImages().isEmpty() 
                                                                ? p.getImages() 
                                                                : (p.getImageUrl() != null ? List.of(p.getImageUrl()) : List.of());
                                                        return new MapMarkerDTO(
                                                                p.getId(),
                                                                p.getLatitude(),
                                                                p.getLongitude(),
                                                                p.getCategory() != null ? p.getCategory().getName() : "Outros",
                                                                p.getCategory() != null ? p.getCategory().getColor() : "#6b7280",
                                                                p.getTitle(),
                                                                p.getContent(),
                                                                p.getProgress() != null ? p.getProgress() : "Em Revisão",
                                                                toFullImageUrls(images)
                                                        );
                                                })
                                                .collect(Collectors.toList());
                                return ResponseEntity.ok(markers);
                }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deletePost(@PathVariable Long id) {
                postService.delete(id);
                return ResponseEntity.noContent().build();
        }

        @GetMapping("/author/{authorId}")
        public ResponseEntity<List<PostDTO>> getPostsByAuthor(@PathVariable Long authorId) {
                List<Post> posts = postService.findByAuthorId(authorId);
                List<PostDTO> list = posts.stream().map(p -> PostDTO.builder()
                                .id(p.getId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .authorId(p.getAuthor() != null ? p.getAuthor().getId() : null)
                                .createdAt(p.getCreatedAt())
                                .images(p.getImages())
                                .progress(p.getProgress())
                                .reposts(p.getReposts())
                                .shares(p.getShares())
                                .build()).collect(Collectors.toList());
                return ResponseEntity.ok(list);
        }

        @GetMapping("/search")
        public ResponseEntity<List<PostDTO>> searchByTitle(@RequestParam String q) {
                List<Post> posts = postService.searchByTitle(q);
                List<PostDTO> list = posts.stream().map(p -> PostDTO.builder()
                                .id(p.getId())
                                .title(p.getTitle())
                                .content(p.getContent())
                                .authorId(p.getAuthor() != null ? p.getAuthor().getId() : null)
                                .createdAt(p.getCreatedAt())
                                .images(p.getImages())
                                .progress(p.getProgress())
                                .reposts(p.getReposts())
                                .shares(p.getShares())
                                .build()).collect(Collectors.toList());
                return ResponseEntity.ok(list);
        }

        @PostMapping("/{id}/upload")
        public ResponseEntity<?> uploadPostImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
                try {
                        // ve se existe o post
                        Post post = postService.findById(id)
                                        .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));

                        //valida o arqvuio
                        String originalFilename = file.getOriginalFilename();
                        if (originalFilename == null || originalFilename.isEmpty()) {
                                return ResponseEntity.badRequest().body("File name is required");
                        }

                        // tamanho
                        if (file.getSize() > MAX_FILE_SIZE) {
                                return ResponseEntity.badRequest().body("File size exceeds maximum limit of 10MB");
                        }

                        //extensao
                        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
                        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
                                return ResponseEntity.badRequest().body("Only image files (jpg, jpeg, png, gif) are allowed");
                        }

                        // salt
                        String filename = "post" + id + "_" + UUID.randomUUID() + "." + fileExtension;
                        Path path = Paths.get(uploadDir).resolve(filename);
                        
                        // cria o diretorio se nao ter
                        Files.createDirectories(path.getParent());
                        
                        // salva
                        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

                        // adiciona pra lsita das iamgens
                        String imageUrl = "/uploads/" + filename;
                        List<String> images = post.getImages() != null ? new ArrayList<>(post.getImages()) : new ArrayList<>();
                        images.add(imageUrl);
                        post.setImages(images);
                        
                        // setta como principal se so ter ela
                        if (post.getImageUrl() == null || post.getImageUrl().isEmpty()) {
                                post.setImageUrl(imageUrl);
                        }
                        
                        postService.update(post);

                        return ResponseEntity.ok(imageUrl);

                } catch (IOException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to store post image: " + e.getMessage());
                }
        }

}
