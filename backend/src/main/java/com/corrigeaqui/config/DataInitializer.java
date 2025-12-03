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

        if (userRepository.count() == 0) {
            User user1 = User.builder()
                .name("Davi Soares")
                .email("davi@goat.com")
                .password(passwordEncoder.encode("senha123"))
                .subtitle("QA principal da nasa")
                .verified(true)
                .build();

            User user2 = User.builder()
                .name("Caio Aguiar")
                .email("caio@goat.com")
                .password(passwordEncoder.encode("senha123"))
                .subtitle("Ex-professor de Linus Torvald")
                .verified(false)
                .build();

            userRepository.saveAll(Arrays.asList(user1, user2));
            System.out.println("debug usuarios");

            Category buracoCategory = categoryRepository.findByName("Buraco").orElseThrow();
            Category iluminacaoCategory = categoryRepository.findByName("Iluminacao").orElseThrow();
            Category calcadaCategory = categoryRepository.findByName("Calcada").orElseThrow();
            Category lixoCategory = categoryRepository.findByName("Lixo").orElseThrow();

 

            Comment comment1 = Comment.builder()
                .content("Também vi este buraco, é muito perigoso mesmo!")
                .author(user2)
                .post(post1)
                .parent(null)
                .replies(Arrays.asList())
                .images(Arrays.asList())
                .build();

            Comment comment2 = Comment.builder()
                .content("Já reportei isso à prefeitura. Espero que resolvam logo.")
                .author(user1)
                .post(post2)
                .parent(null)
                .replies(Arrays.asList())
                .images(Arrays.asList())
                .build();

            commentRepository.saveAll(Arrays.asList(comment1, comment2));
            System.out.println("Comentários de exemplo salvos");

            Like like1 = Like.builder()
                .user(user2)
                .post(post1)
                .build();

            Like like2 = Like.builder()
                .user(user1)
                .post(post2)
                .build();

            likeRepository.saveAll(Arrays.asList(like1, like2));
            System.out.println("debug curtidas");
        }
    }
}