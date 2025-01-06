package com.sneakyghost.twentyplots.db;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sneakyghost.twentyplots.entities.PlotAnnouncement;

public interface PlotAnnouncementRepository extends JpaRepository<PlotAnnouncement, Long> {
    List<PlotAnnouncement> findByUserId(Long userId);
    void deleteByUserId(Long userId);
    void deleteByPlotIdAndUserId(Long plotId, Long userId);
}
