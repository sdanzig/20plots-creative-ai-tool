package com.sneakyghost.twentyplots.dtos;

public class AiQueryRequest {
    private String userPrompt;
    private String model;

    public String getUserPrompt() {
        return userPrompt;
    }

    public void setUserPrompt(String userPrompt) {
        this.userPrompt = userPrompt;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}