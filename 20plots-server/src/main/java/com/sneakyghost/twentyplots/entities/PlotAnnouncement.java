package com.sneakyghost.twentyplots.entities;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;

@Entity
@Table(name = "unannounced_plots")
public class PlotAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "plot_id", nullable = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Plot plot;

    @Column(name = "generation_error", nullable = true)
    private String generationError;

    public PlotAnnouncement() {}

    public PlotAnnouncement(Long userId, Plot plot) {
        this(userId, plot, null);
    }

    public PlotAnnouncement(Long userId, Plot plot, String generationError) {
        this.userId = userId;
        this.plot = plot;
        this.generationError = generationError;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Plot getPlot() {
        return plot;
    }

    public void setPlot(Plot plot) {
        this.plot = plot;
    }

    public String getGenerationError() {
        return generationError;
    }

    public void setGenerationError(String generationError) {
        this.generationError = generationError;
    }
}
