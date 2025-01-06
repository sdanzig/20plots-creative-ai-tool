package com.sneakyghost.twentyplots.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No elements created")
public class NoElementsCreatedException extends RuntimeException {
    public NoElementsCreatedException() {
        super("No elements created");
    }
}
