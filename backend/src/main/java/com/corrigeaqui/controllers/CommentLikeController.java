package com.corrigeaqui.controllers;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.corrigeaqui.exceptions.ResourceNotFoundException;
import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.CommentLike;
import com.corrigeaqui.models.User;
import com.corrigeaqui.services.CommentLikeService;
import com.corrigeaqui.services.CommentService;
import com.corrigeaqui.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/comment-likes")
@RequiredArgsConstructor
@Tag(name = "Curtidas de Comentários", description = "Endpoints para gerenciamento de curtidas em comentários")
public class CommentLikeController {

    private final CommentLikeService commentLikeService;
    private final UserService userService;
    private final CommentService commentService;

    @PostMapping("/comments/{commentId}/likes")
    @Operation(summary = "Curtir comentário", description = "Registra uma curtida de um usuário em um comentário")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Curtida registrada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário ou comentário não encontrado"),
            @ApiResponse(responseCode = "409", description = "Usuário já curtiu este comentário")
    })
    public ResponseEntity<Void> likeComment(
            @Parameter(description = "ID do comentário") @PathVariable Long commentId,
            @Parameter(description = "ID do usuário") @RequestParam Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Comment comment = commentService.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        
        CommentLike like = commentLikeService.likeComment(user, comment);
        if (like == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.created(URI.create("/comment-likes/" + like.getId())).build();
    }

    @DeleteMapping("/comments/{commentId}/likes")
    @Operation(summary = "Descurtir comentário", description = "Remove a curtida de um usuário em um comentário")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Curtida removida com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário ou comentário não encontrado")
    })
    public ResponseEntity<Void> unlikeComment(
            @Parameter(description = "ID do comentário") @PathVariable Long commentId,
            @Parameter(description = "ID do usuário") @RequestParam Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Comment comment = commentService.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        
        commentLikeService.unlikeComment(user, comment);
        return ResponseEntity.noContent().build();
    }
}
