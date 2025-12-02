package com.corrigeaqui.services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import com.corrigeaqui.repositories.CommentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public Comment create(Comment comment) {
        return commentRepository.save(comment);
    }

    public Optional<Comment> findById(Long id) {
        return commentRepository.findById(id);
    }

    public List<Comment> findAll() {
        return commentRepository.findAll();
    }

    public List<Comment> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository.findAll(pageable).getContent();
    }

    public Comment update(Comment comment) {
        return commentRepository.save(comment);
    }

    public void delete(Long id) {
        commentRepository.deleteById(id);
    }

    public List<Comment> findByAuthor(User author) {
        return commentRepository.findByAuthor(author);
    }

    public List<Comment> findByPost(Post post) {
        return commentRepository.findByPostWithAuthor(post);
    }

    public List<Comment> findByPost(Post post, int page, int size) {
        return commentRepository.findByPostWithAuthor(post);
    }
}
