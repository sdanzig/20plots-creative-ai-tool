package com.sneakyghost.twentyplots.db;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sneakyghost.twentyplots.entities.Location;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByUserId(Long userId);
    Optional<Location> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
