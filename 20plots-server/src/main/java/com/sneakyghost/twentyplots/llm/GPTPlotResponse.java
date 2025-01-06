package com.sneakyghost.twentyplots.llm;

import java.util.List;

public class GPTPlotResponse {
    private String title;
    private String description;
    private List<String> selectedElements;

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

    public List<String> getSelectedElements() {
        return selectedElements;
    }

    public void setElements(List<String> selectedElements) {
        this.selectedElements = selectedElements;
    }
}
