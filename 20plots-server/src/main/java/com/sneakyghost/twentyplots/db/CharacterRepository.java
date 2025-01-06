package com.sneakyghost.twentyplots.db;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sneakyghost.twentyplots.entities.Character;

import java.util.List;
import java.util.Optional;

public interface CharacterRepository extends JpaRepository<Character, Long> {
    List<Character> findByUserId(Long userId);
    Optional<Character> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
