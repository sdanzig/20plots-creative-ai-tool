package com.sneakyghost.twentyplots.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No elements selected")
public class NoElementsProvidedException extends RuntimeException {
    public NoElementsProvidedException() {
        super("No elements selected");
    }
}