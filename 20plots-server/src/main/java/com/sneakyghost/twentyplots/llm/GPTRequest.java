package com.sneakyghost.twentyplots.llm;

import java.util.List;

public class GPTRequest {
    private String model;
    private List<GPTMessage> messages;
    private double temperature;

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<GPTMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<GPTMessage> messages) {
        this.messages = messages;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }
}
