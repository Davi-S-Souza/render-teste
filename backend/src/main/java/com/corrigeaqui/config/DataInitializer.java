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

            Post post1 = Post.builder()
                .title("Buraco grande na Rua Principal")
                .content("Há um buraco grande e profundo na rua do ifsc. A situação piora a cada dia e já causou pequenos acidentes, especialmente com motos. Motoristas precisam desviar bruscamente, o que é bem arriscado. Em dias de chuva o buraco fica encoberto pela água, aumentando ainda mais o perigo.")
                .latitude(-27.6080)
                .longitude(-48.6304)
                .author(user2)
                .category(buracoCategory)
                .images(Arrays.asList("/uploads/exemplo1.jpg"))
                .build();

            Post post2 = Post.builder()
                .title("Iluminação pública queimada")
                .content("Os postes de iluminação da Sebastiana Coutinho estão apagados há semanas, deixando a área bem escura à noite. Moradores relatam sensação de insegurança e dificuldade para caminhar, já que é difícil ver buracos e desníveis na calçada. A falta de luz torna o local mais perigoso para quem passa por ali.")
                .latitude(-27.5603)
                .longitude(-48.6277)
                .author(user1)
                .category(iluminacaoCategory)
                .images(Arrays.asList("/uploads/exemplo2.jpeg"))
                .build();

            Post post3 = Post.builder()
                .title("Vazamento de água na calçada")
                .content("Há um vazamento constante de água na calçada da Rua Elias Merize. A água corre dia e noite, formando poças e deixando o piso escorregadio. Já vi pessoas quase caindo ali. Além do desperdício, o vazamento está piorando e pode causar danos ao pavimento.")
                .latitude(-27.5962)
                .longitude(-48.6269)
                .author(user1)
                .category(calcadaCategory)
                .images(Arrays.asList("/uploads/exemplo3.jpg"))
                .build();

            Post post4 = Post.builder()
                .title("Lixeira pública danificada")
                .content("Uma lixeira pública da UFSC está quebrada há vários dias. A tampa não fecha, e o lixo acaba se espalhando com o vento e com animais que mexem nos resíduos. O local está começando a ficar com mau cheiro e precisa de manutenção para evitar sujeira e atrair insetos.")
                .latitude(-27.6017)
                .longitude(-48.5220)
                .author(user2)
                .category(lixoCategory)
                .images(Arrays.asList("/uploads/exemplo4.jpg"))
                .build();

            postRepository.saveAll(Arrays.asList(post1, post2, post3, post4));
            System.out.println("debug posts");

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