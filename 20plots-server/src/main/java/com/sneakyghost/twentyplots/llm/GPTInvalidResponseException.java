package com.sneakyghost.twentyplots.llm;

public class GPTInvalidResponseException extends Exception {
    public GPTInvalidResponseException(String message) {
        super(message);
    }

    public GPTInvalidResponseException(String message, Throwable cause) {
        super(message, cause);
    }
}
