package com.sneakyghost.twentyplots;

public class RateLimitException extends Exception {
    public RateLimitException(String message) {
        super(message);
    }
}