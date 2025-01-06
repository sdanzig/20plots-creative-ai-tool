package com.sneakyghost.twentyplots.entities;

import com.fasterxml.jackson.databind.node.ObjectNode;

public interface Element {
    ObjectNode generateJSON();
    String getName();
    String getDescription();
    String getType();
    Long getUserId();
}
