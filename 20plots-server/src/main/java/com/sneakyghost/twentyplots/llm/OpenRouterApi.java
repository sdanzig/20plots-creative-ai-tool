package com.sneakyghost.twentyplots.llm;

import com.theokanning.openai.completion.chat.ChatCompletionChunk;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;

import io.reactivex.Flowable;
import io.reactivex.Single;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.Streaming;
import retrofit2.http.Header;
import retrofit2.http.Headers;

public interface OpenRouterApi {
    @POST("v1/chat/completions")
    @Headers({
        "Content-Type: application/json",
        "HTTP-Referer: https://20plots.com",
        "X-Title: 20plots"
    })
    Single<ChatCompletionResult> createChatCompletion(@Header("Authorization") String apiKey, @Body ChatCompletionRequest request);
}