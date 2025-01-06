package com.sneakyghost.twentyplots.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Entity
@Table(name = "anecdotes")
public class Anecdote implements Element {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(length = 255)
    private String name;

    @Column(length = 2047)
    private String description;

    @Column(length = 15)
    private String type = "anecdote";

    @Column(name = "user_id")
    private Long userId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // Set the id
    public void setId(Long id) {
        this.id = id;
    }

    // Get the id
    public Long getId() {
        return id;
    }

    // Get name of anecdote
    public String getName() {
        return name;
    }

    // Set name of anecdote
    public void setName(String name) {
        this.name = name;
    }

    // Get description of anecdote
    public String getDescription() {
        return description;
    }

    // Set description of anecdote
    public void setDescription(String description) {
        this.description = description;
    }

    // Get type of element
    public String getType() {
        return type;
    }

    public ObjectNode generateJSON() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode json = mapper.createObjectNode();
        json.put("type", "anecdote");
        json.put("name", name);
        json.put("description", description);
        return json;
    }
}
