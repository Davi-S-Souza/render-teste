package com.corrigeaqui.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI corrigeAquiOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8080");
        devServer.setDescription("Servidor de Desenvolvimento");

        Contact contact = new Contact();
        contact.setEmail("corrige_aqui@hotmail.com");
        contact.setName("Equipe Corrige Aqui");
        contact.setUrl("https://github.com/ifsc-arliones/projeto-daio");

        License license = new License()
                .name("MIT License")
                .url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
                .title("Corrige Aqui! API")
                .version("1.0.0")
                .contact(contact)
                .description("API REST para plataforma de denúncias de problemas de infraestrutura urbana. "
                        + "Esta API permite registrar, visualizar e gerenciar denúncias geolocalizadas, "
                        + "promovendo transparência e participação cidadã na melhoria dos espaços públicos.")
                .termsOfService("https://github.com/ifsc-arliones/projeto-daio")
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer));
    }
}
