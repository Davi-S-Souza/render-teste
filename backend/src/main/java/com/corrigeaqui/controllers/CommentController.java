package com.corrigeaqui.controllers;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.corrigeaqui.dtos.CommentDTO;
import com.corrigeaqui.exceptions.ResourceNotFoundException;
import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import com.corrigeaqui.services.CommentService;
import com.corrigeaqui.services.CommentLikeService;
import com.corrigeaqui.services.PostService;
import com.corrigeaqui.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@Tag(name = "Comentários", description = "Endpoints para gerenciamento de comentários em denúncias")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;
    private final PostService postService;
    private final CommentLikeService commentLikeService;

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getAllComments(@RequestParam(required = false) Long postId,
                                                           @RequestParam(required = false) Long userId,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        List<Comment> comments;
        if (postId != null) {
            Post post = postService.findById(postId)
                    .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
            comments = commentService.findByPost(post, page, size);
        } else {
            comments = commentService.findAll(page, size);
        }
        
        User currentUser = userId != null ? userService.findById(userId).orElse(null) : null;
        
        List<CommentDTO> body = comments.stream()
                .map(c -> buildCommentDTO(c, currentUser))
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header("X-Page", String.valueOf(page))
                .header("X-Size", String.valueOf(size))
                .body(body);
    }
    
    private CommentDTO buildCommentDTO(Comment c, User currentUser) {
        String authorName = "Unknown";
        String authorAvatar = "/uploads/default-avatar.png";
        Long authorId = null;
        
        if (c.getAuthor() != null) {
            authorId = c.getAuthor().getId();
            authorName = c.getAuthor().getName() != null ? c.getAuthor().getName() : "Unknown";
            authorAvatar = c.getAuthor().getAvatar() != null ? c.getAuthor().getAvatar() : "/uploads/default-avatar.png";
        }
        
        List<CommentDTO> replyDTOs = null;
        if (c.getReplies() != null && !c.getReplies().isEmpty()) {
            replyDTOs = c.getReplies().stream()
                .map(reply -> buildCommentDTO(reply, currentUser))
                .collect(Collectors.toList());
        }
        
        return CommentDTO.builder()
            .id(c.getId())
            .content(c.getContent())
            .authorId(authorId)
            .authorName(authorName)
            .authorAvatar(authorAvatar)
            .postId(c.getPost() != null ? c.getPost().getId() : null)
            .parentId(c.getParent() != null ? c.getParent().getId() : null)
            .createdAt(c.getCreatedAt())
            .images(c.getImages())
            .likeCount(commentLikeService.getLikeCount(c))
            .liked(currentUser != null ? commentLikeService.hasUserLiked(currentUser, c) : false)
            .replies(replyDTOs)
            .build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        Comment c = commentService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + id));
        
        User currentUser = userId != null ? userService.findById(userId).orElse(null) : null;
        
        CommentDTO dto = buildCommentDTO(c, currentUser);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @Operation(summary = "Criar comentário", description = "Adiciona um novo comentário a uma denúncia")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Comentário criado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário ou denúncia não encontrado")
    })
    public ResponseEntity<CommentDTO> createComment(@Valid @RequestBody CommentDTO dto) {
        User author = userService.findById(dto.getAuthorId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.getAuthorId()));
        Post post = postService.findById(dto.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + dto.getPostId()));
        
        Comment parent = null;
        if (dto.getParentId() != null) {
            parent = commentService.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found: " + dto.getParentId()));
        }
        
        Comment comment = Comment.builder()
                .content(dto.getContent())
                .author(author)
                .post(post)
                .parent(parent)
                .build();
        Comment saved = commentService.create(comment);
        CommentDTO response = CommentDTO.builder()
                .id(saved.getId())
                .content(saved.getContent())
                .authorId(saved.getAuthor().getId())
                .postId(saved.getPost().getId())
                .parentId(saved.getParent() != null ? saved.getParent().getId() : null)
                .createdAt(saved.getCreatedAt())
                .images(saved.getImages())
                .build();
        return ResponseEntity.created(URI.create("/comments/" + saved.getId())).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CommentDTO> patchComment(@PathVariable Long id, @RequestBody CommentDTO dto) {
        Comment existing = commentService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + id));
        
        // Update content if provided
        if (dto.getContent() != null && !dto.getContent().isBlank()) {
            existing.setContent(dto.getContent());
        }
        
        // Update images if provided
        if (dto.getImages() != null) {
            existing.setImages(dto.getImages());
        }
        
        Comment updated = commentService.update(existing);
        CommentDTO response = CommentDTO.builder()
                .id(updated.getId())
                .content(updated.getContent())
                .authorId(updated.getAuthor() != null ? updated.getAuthor().getId() : null)
                .postId(updated.getPost() != null ? updated.getPost().getId() : null)
                .createdAt(updated.getCreatedAt())
                .images(updated.getImages())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
