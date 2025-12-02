package com.corrigeaqui.controllers;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.corrigeaqui.dtos.LikeDTO;
import com.corrigeaqui.exceptions.ResourceNotFoundException;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import com.corrigeaqui.services.LikeService;
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
@RequestMapping("/likes")
@RequiredArgsConstructor
@Tag(name = "Curtidas", description = "Endpoints para gerenciamento de curtidas em denúncias")
public class LikeController {

    private final LikeService likeService;
    private final UserService userService;
    private final PostService postService;

    @PostMapping("/{userId}/post/{postId}")
    @Operation(summary = "Curtir denúncia", description = "Registra uma curtida de um usuário em uma denúncia")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Curtida registrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário ou denúncia não encontrado"),
            @ApiResponse(responseCode = "409", description = "Usuário já curtiu esta denúncia")
    })
    public ResponseEntity<Void> likePost(
            @Parameter(description = "ID do usuário") @PathVariable Long userId, 
            @Parameter(description = "ID da denúncia") @PathVariable Long postId) {
        User user = userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Post post = postService.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        var like = likeService.likePost(user, post);
        if (like == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping("/{userId}/post/{postId}")
    public ResponseEntity<Void> unlikePost(@PathVariable Long userId, @PathVariable Long postId) {
        User user = userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Post post = postService.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        likeService.unlikePost(user, post);
        return ResponseEntity.noContent().build();
    }

    // More RESTful endpoints (preferred): operate under /posts/{postId}/likes
    @PostMapping("/posts/{postId}/likes")
    public ResponseEntity<Void> likePostByPost(@PathVariable Long postId, @Valid @RequestBody LikeDTO dto) {
        Long userId = dto.getUserId();
        User user = userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Post post = postService.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        var like = likeService.likePost(user, post);
        if (like == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.created(URI.create("/likes/" + like.getId())).build();
    }

    @DeleteMapping("/posts/{postId}/likes")
    public ResponseEntity<Void> unlikePostByPost(@PathVariable Long postId, @RequestParam Long userId) {
        User user = userService.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Post post = postService.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        likeService.unlikePost(user, post);
        return ResponseEntity.noContent().build();
    }
}
