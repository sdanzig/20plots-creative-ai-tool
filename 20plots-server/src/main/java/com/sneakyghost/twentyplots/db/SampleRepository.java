package com.sneakyghost.twentyplots.db;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sneakyghost.twentyplots.entities.Sample;

public interface SampleRepository extends JpaRepository<Sample, Long> {
    Sample findByUserIdAndPlotIdAndFormat(Long userId, Long plotId, String format);
    void deleteByUserIdAndPlotId(Long userId, Long plotId);
}
