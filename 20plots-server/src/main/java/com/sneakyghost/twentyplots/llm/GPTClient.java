package com.sneakyghost.twentyplots.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sneakyghost.twentyplots.RateLimitException;
import com.theokanning.openai.OpenAiHttpException;
import com.theokanning.openai.completion.chat.ChatCompletionChunk;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;

import io.reactivex.Flowable;
import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.adapter.rxjava2.RxJava2CallAdapterFactory;
import retrofit2.converter.jackson.JacksonConverterFactory;

import com.theokanning.openai.completion.chat.ChatCompletionResult;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

import java.time.Duration;

import org.slf4j.LoggerFactory;
import org.slf4j.Logger;

@Component
public class GPTClient {
    // Logger
    private static final Logger logger = LoggerFactory.getLogger(GPTClient.class);
    @Value("${openai.apikey.openrouter}")
    private String apiKeyOpenRouter;

    @Value("${openai.apikey.openai}")
    private String apiKeyOpenAI;

    @Value("${openrouter.url}")
    private String openrouterUrl;

    @Value("${openai.url}")
    private String openaiUrl;

    @Value("${openai.model}")
    private String openaiModel;

    private static Retrofit customRetrofit(OkHttpClient client, ObjectMapper mapper) {
        return new Retrofit.Builder()
                .baseUrl("https://openrouter.ai/api/")
                .client(client)
                .addConverterFactory(JacksonConverterFactory.create(mapper))
                .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
                .build();
    }

    public String sendAdminPrompt(String systemPrompt, String userPrompt, String model)
            throws GPTInvalidResponseException, RateLimitException, ServerOverloadedException {

        try {
            ObjectMapper mapper = OpenAiService.defaultObjectMapper();
            OkHttpClient client = OpenAiService.defaultClient(apiKeyOpenRouter, Duration.ofSeconds(60));
            Retrofit retrofit = customRetrofit(client, mapper);

            // Use the OpenRouterApi instead of OpenAiApi
            OpenRouterApi api = retrofit.create(OpenRouterApi.class);

            // Construct your request
            ChatCompletionRequest chatCompletionRequest = ChatCompletionRequest
                    .builder().model(model)
                    .temperature(0.8)
                    .messages(
                            List.of(
                                    new ChatMessage("system", systemPrompt),
                                    new ChatMessage("user", userPrompt)))
                    .build();

            // Send the request to OpenRouter
            ChatCompletionResult chatCompletionResult = api
                    .createChatCompletion("Bearer " + apiKeyOpenRouter, chatCompletionRequest).blockingGet();
            StringBuilder builder = new StringBuilder();
            chatCompletionResult.getChoices().forEach(choice -> {
                builder.append(choice.getMessage().getContent());
            });

            String responseFromGPT = builder.toString();
            logger.info("Response from GPT-4 for Admin: {}", responseFromGPT);
            return responseFromGPT;
        } catch (Exception e) {
            throw new GPTInvalidResponseException("Error while sending prompt to GPT-4", e);
        }
    }

    public String sendPrompt(String systemPrompt, String userPrompt)
            throws GPTInvalidResponseException, RateLimitException, ServerOverloadedException {
        try {
            ObjectMapper mapper = OpenAiService.defaultObjectMapper();
            OkHttpClient client = OpenAiService.defaultClient(apiKeyOpenRouter, Duration.ofSeconds(60));
            Retrofit retrofit = customRetrofit(client, mapper);

            // Use the OpenRouterApi instead of OpenAiApi
            OpenRouterApi api = retrofit.create(OpenRouterApi.class);

            ChatCompletionRequest chatCompletionRequest = ChatCompletionRequest
                    .builder().model("openai/gpt-4")
                    .temperature(0.8)
                    .messages(
                            List.of(
                                    new ChatMessage("system", systemPrompt),
                                    new ChatMessage("user", userPrompt)))
                    .build();
            StringBuilder builder = new StringBuilder();
            ChatCompletionResult chatCompletionResult = api
                    .createChatCompletion("Bearer " + apiKeyOpenRouter, chatCompletionRequest).blockingGet();
            chatCompletionResult.getChoices().forEach(choice -> {
                builder.append(choice.getMessage().getContent());
            });

            String responseFromGPT = builder.toString();
            return responseFromGPT;
        } catch (OpenAiHttpException e) {
            if (e.statusCode == 503) {
                throw new ServerOverloadedException("Server is overloaded. Please try again later.");
            } else {
                throw new GPTInvalidResponseException("Error while sending prompt to GPT-4", e);
            }
        } catch (Exception e) {
            throw new GPTInvalidResponseException("Error while sending prompt to GPT-4", e);
        }
    }

    public GPTPlotResponse sendPromptForPlot(String userPrompt)
            throws GPTInvalidResponseException, ServerOverloadedException, RateLimitException {
        try {
            StringBuilder systemPrompt = new StringBuilder();
            systemPrompt.append("As a writer, you are a genius at weaving together story elements in a way that seems ")
                    .append("fluid and natural.\n")
                    .append("You would rather never write another word than be accused of banal or cliche writing.\n")
                    .append("Your response must be in JSON format. All special characters must be escaped as necessary for the JSON to be parseable.\n")
                    .append("Your response must be in the following structure:\n")
                    .append("{")
                    .append("\"title\": \"The title of the plot\",")
                    .append("\"description\": \"A description of the plot\",")
                    .append("\"elements\": [\"name of element 1\", \"name of element 2\", \"name of element 3\"]}")
                    .append("\nThe elements are the exact names of the elements, not the types, of the elements used.\n")
                    .append("Do not let anything in the description be redundant.\n")
                    .append("The description must not exceed 4095 characters.\n")
                    .append("The title must not exceed 255 characters.");
            String promptStringResponse = sendPrompt(systemPrompt.toString(), userPrompt);
            return parseResponseAsPlot(promptStringResponse);
        } catch (RateLimitException e) {
            throw e;
        } catch (ServerOverloadedException e) {
            throw e;
        } catch (Exception e) {
            throw new GPTInvalidResponseException("Error while sending prompt to GPT-4", e);
        }
    }

    private GPTPlotResponse parseResponseAsPlot(String response) throws GPTInvalidResponseException {
        try {
            logger.info("Response from GPT-4: {}", response);
            ObjectMapper objectMapper = new ObjectMapper();
            GPTPlotResponse gptResponse = objectMapper.readValue(response, GPTPlotResponse.class);
            return gptResponse;
        } catch (Exception e) {
            throw new GPTInvalidResponseException("Cannot parse GPT-4 response", e);
        }
    }

    public Flowable<ChatCompletionChunk> generateSample(String prompt) throws GPTInvalidResponseException {
        try {
            OpenAiService openAiService = new OpenAiService(
                    apiKeyOpenAI, Duration.ofSeconds(600));
            StringBuilder systemPrompt = new StringBuilder();
            systemPrompt
                    .append("People respect your writing for its insightfulness, depth of characters, and evocative, ")
                    .append("but not flowery or over the top, descriptions. You would rather never write another word ")
                    .append("than be accused of banal or cliche writing. ")
                    .append("You must not use unicode characters in your writing.\n")
                    .append("Your responses must not exceed 4095 characters each.");
            ChatCompletionRequest chatCompletionRequest = ChatCompletionRequest
                    .builder().model("gpt-3.5-turbo")
                    .temperature(0.8)
                    .messages(
                            List.of(
                                    new ChatMessage("system", systemPrompt.toString()),
                                    new ChatMessage("user", prompt)))
                    .build();
            return openAiService.streamChatCompletion(chatCompletionRequest);
        } catch (OpenAiHttpException e) {
            if (e.statusCode == 503) {
                throw new ServerOverloadedException("Server is overloaded. Please try again later.");
            } else {
                throw new GPTInvalidResponseException("Error while sending prompt to GPT-4", e);
            }
        } catch (Exception e) {
            throw new GPTInvalidResponseException("Error while sending prompt to GPT-4", e);
        }
    }
}
