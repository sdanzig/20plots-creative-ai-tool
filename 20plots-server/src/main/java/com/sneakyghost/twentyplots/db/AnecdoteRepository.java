package com.sneakyghost.twentyplots.db;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sneakyghost.twentyplots.entities.Anecdote;

import java.util.List;
import java.util.Optional;

public interface AnecdoteRepository extends JpaRepository<Anecdote, Long> {
    List<Anecdote> findByUserId(Long userId);
    Optional<Anecdote> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
