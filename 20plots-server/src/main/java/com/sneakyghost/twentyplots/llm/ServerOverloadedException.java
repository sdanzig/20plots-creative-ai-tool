package com.sneakyghost.twentyplots.llm;

public class ServerOverloadedException extends RuntimeException {
    public ServerOverloadedException(String message) {
        super(message);
    }
}

