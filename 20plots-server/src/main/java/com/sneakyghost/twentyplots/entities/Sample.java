package com.sneakyghost.twentyplots.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Id;

@Entity
@Table(name = "samples")
public class Sample {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "plot_id")
    private Long plotId;

    @Column(length = 31)
    private String format;

    @Column(length = 4095)
    private String text;

    public Sample() {
    }

    public Sample(Long userId, Long plotId, String format, String text) {
        this.userId = userId;
        this.plotId = plotId;
        this.format = format;
        this.text = text;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return this.userId;
    }

    public void setUserId(Long id) {
        this.userId = id;
    }

    public Long getPlotId() {
        return this.plotId;
    }

    public void setPlotId(Long id) {
        this.plotId = id;
    }

    public String getFormat() {
        return this.format;
    }

    public void setFormat(String f) {
        this.format = f;
    }

    public String getText() {
        return this.text;
    }

    public void setText(String t) {
        this.text = t;
    }
}
