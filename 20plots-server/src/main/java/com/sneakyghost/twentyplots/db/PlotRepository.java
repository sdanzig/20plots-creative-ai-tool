package com.sneakyghost.twentyplots.db;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sneakyghost.twentyplots.entities.Plot;

import java.util.List;
import java.util.Optional;

public interface PlotRepository extends JpaRepository<Plot, Long> {
    List<Plot> findByUserId(Long userId);
    Optional<Plot> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
    boolean existsByIdAndUserId(Long id, Long userId);
}
