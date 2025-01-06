package com.sneakyghost.twentyplots.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "plots")
public class Plot {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(length = 255)
    private String title;

    @Column(length = 4095)
    private String description;

    @Column(length = 31)
    private String genre;

    @ElementCollection
    @CollectionTable(name = "selected_elements", joinColumns = @JoinColumn(name = "plot_id"))
    private List<SelectedElement> selectedElements;

    @Column(name = "created")
    private LocalDateTime created;

    @Column(name = "user_id")
    private Long userId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public List<SelectedElement> getSelectedElements() {
        return selectedElements;
    }

    public void setSelectedElements(List<SelectedElement> selectedElements) {
        this.selectedElements = selectedElements;
    }

    public LocalDateTime getCreated() {
        return created;
    }

    public void setCreated(LocalDateTime created) {
        this.created = created;
    }
}
