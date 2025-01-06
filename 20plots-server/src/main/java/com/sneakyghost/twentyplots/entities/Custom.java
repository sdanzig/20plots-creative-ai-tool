package com.sneakyghost.twentyplots.entities;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class Custom implements Element {
    private String name;
    private String description;
    private String type = "custom";
    private Long userId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

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
        json.put("type", "custom");
        json.put("name", name);
        json.put("description", description);
        return json;
    }
}
