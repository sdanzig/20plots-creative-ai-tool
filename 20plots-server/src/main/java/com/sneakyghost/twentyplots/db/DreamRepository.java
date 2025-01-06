package com.sneakyghost.twentyplots.db;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sneakyghost.twentyplots.entities.Dream;

import java.util.List;
import java.util.Optional;

public interface DreamRepository extends JpaRepository<Dream, Long> {
    List<Dream> findByUserId(Long userId);
    Optional<Dream> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
