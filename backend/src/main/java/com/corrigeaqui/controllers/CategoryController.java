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
import org.springframework.web.bind.annotation.RestController;

import com.corrigeaqui.dtos.CategoryDTO;
import com.corrigeaqui.exceptions.ResourceNotFoundException;
import com.corrigeaqui.models.Category;
import com.corrigeaqui.services.CategoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categorias", description = "Endpoints para gerenciamento de categorias de denúncias")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Listar categorias", description = "Retorna todas as categorias disponíveis")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de categorias retornada com sucesso")
    })
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<Category> categories = categoryService.findAll();
        List<CategoryDTO> list = categories.stream().map(c -> CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .color(c.getColor())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        CategoryDTO dto = CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .color(category.getColor())
                .build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO dto) {
        Category category = Category.builder()
                .name(dto.getName())
                .color(dto.getColor())
                .build();
        Category saved = categoryService.create(category);
        CategoryDTO response = CategoryDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .color(saved.getColor())
                .build();
        return ResponseEntity.created(URI.create("/categories/" + saved.getId())).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CategoryDTO> patchCategory(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        Category existing = categoryService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        
        if (dto.getName() != null && !dto.getName().isBlank()) {
            existing.setName(dto.getName());
        }
        if (dto.getColor() != null && !dto.getColor().isBlank()) {
            existing.setColor(dto.getColor());
        }
        
        Category updated = categoryService.update(existing);
        CategoryDTO response = CategoryDTO.builder()
                .id(updated.getId())
                .name(updated.getName())
                .color(updated.getColor())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
