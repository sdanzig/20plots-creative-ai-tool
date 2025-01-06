package com.sneakyghost.twentyplots.entities;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;

@Embeddable
public class SelectedElement {

    @Column(length = 255)
    private String name;

    @Column(length = 2047)
    private String description;

    @Column(length = 15)
    private String type;
    private Long userId;

    public SelectedElement() {
    }

    public SelectedElement(String name, String description, String type, Long userId) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public ObjectNode generateJSON() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode json = mapper.createObjectNode();
        json.put("type", type);
        json.put("name", name);
        json.put("description", description);
        return json;
    }
}
