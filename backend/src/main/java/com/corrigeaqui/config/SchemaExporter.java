package com.corrigeaqui.config;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;

@Component
public class SchemaExporter implements CommandLineRunner {

    @Autowired
    private EntityManager em;

    @Override
    public void run(String... args) throws Exception {
        Map<String, Object> schema = new HashMap<>();

        for (EntityType<?> entity : em.getMetamodel().getEntities()) {
            Map<String, Object> fields = new HashMap<>();
            entity.getAttributes().forEach(attr -> {
                fields.put(attr.getName(), attr.getJavaType().getSimpleName());
            });
            schema.put(entity.getName(), fields);
        }

        ObjectMapper mapper = new ObjectMapper();mapper.writerWithDefaultPrettyPrinter().writeValue(
    new File("/tmp/schema.json"), schema
);



        System.out.println("Schema JSON gerado em schema.json");
    }
}
