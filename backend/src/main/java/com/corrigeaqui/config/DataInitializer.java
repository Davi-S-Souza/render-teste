package com.corrigeaqui.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.corrigeaqui.models.Category;
import com.corrigeaqui.models.Comment;
import com.corrigeaqui.models.Like;
import com.corrigeaqui.models.Post;
import com.corrigeaqui.models.User;
import com.corrigeaqui.repositories.CategoryRepository;
import com.corrigeaqui.repositories.CommentRepository;
import com.corrigeaqui.repositories.LikeRepository;
import com.corrigeaqui.repositories.PostRepository;
import com.corrigeaqui.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = Arrays.asList(
                Category.builder().name("Buraco").color("#f97316").build(),
                Category.builder().name("Iluminacao").color("#eab308").build(),
                Category.builder().name("Lixo").color("#ef4444").build(),
                Category.builder().name("Sinalizacao").color("#3b82f6").build(),
                Category.builder().name("Calcada").color("#a855f7").build(),
                Category.builder().name("Outros").color("#6b7280").build()
            );
            
            categoryRepository.saveAll(defaultCategories);
            System.out.println("debug categorias");
        }

        }
    }
