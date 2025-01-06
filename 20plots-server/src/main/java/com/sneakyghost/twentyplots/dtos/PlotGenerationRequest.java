package com.sneakyghost.twentyplots.dtos;

import java.util.List;

import com.sneakyghost.twentyplots.entities.SelectedElement;

public class PlotGenerationRequest {
    private List<SelectedElement> selectedElements;
    private boolean useCurrentElements;

    public List<SelectedElement> getSelectedElements() {
        return selectedElements;
    }

    public void setSelectedElements(List<SelectedElement> selectedElements) {
        this.selectedElements = selectedElements;
    }

    public boolean getUseCurrentElements() {
        return useCurrentElements;
    }

    public void setUseCurrentElements(boolean useCurrentElements) {
        this.useCurrentElements = useCurrentElements;
    }
}
