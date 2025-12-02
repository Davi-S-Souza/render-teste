package com.corrigeaqui.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.corrigeaqui.models.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}
