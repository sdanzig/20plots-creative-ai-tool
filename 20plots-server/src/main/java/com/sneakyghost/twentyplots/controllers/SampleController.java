package com.sneakyghost.twentyplots.controllers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.services.SampleService;
import com.sneakyghost.twentyplots.services.PlotService;
import com.sneakyghost.twentyplots.entities.Plot;
import com.sneakyghost.twentyplots.entities.Sample;
import com.sneakyghost.twentyplots.llm.GPTClient;

@RestController
@RequestMapping("/api/plots/{plotId}/samples")
public class SampleController {
    private static final Logger logger = LoggerFactory.getLogger(SampleController.class);

    @Autowired
    private SampleService sampleService;

    @Autowired
    private PlotService plotService;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private GPTClient gptClient;

    @GetMapping("/get-or-create")
    public SseEmitter getOrCreateSample(@PathVariable Long plotId,
            @RequestParam("token") String token,
            @RequestParam String sampleFormat) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);

        Sample sample = sampleService.getSample(userId, plotId, sampleFormat);
        SseEmitter emitter = new SseEmitter();
        ExecutorService executor = Executors.newCachedThreadPool();

        executor.execute(() -> {
            if (sample != null) {
                try {
                    String encodedData = Base64.getEncoder()
                            .encodeToString(sample.getText().getBytes(StandardCharsets.UTF_8));
                    emitter.send(SseEmitter.event().data(encodedData));
                    emitter.send(SseEmitter.event().name("complete").data("complete"));
                    emitter.complete();
                } catch (IOException e) {
                    logger.error("IOException while sending story sample found in database: {}", e);
                    emitter.completeWithError(e);
                }
            } else {
                Plot plot = null;
                if (sample == null) {
                    plot = plotService.getPlot(plotId, userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plot not found"));
                }
                String prompt = createPrompt(sampleFormat, plot);
                StringBuilder generatedSample = new StringBuilder();
                try {
                    gptClient.generateSample(prompt)
                            .doOnError(Throwable::printStackTrace)
                            .blockingForEach(response -> {
                                try {
                                    String responseData = response.getChoices().get(0).getMessage().getContent();
                                    if (responseData != null && !responseData.equals("")) {
                                        generatedSample.append(responseData);
                                        String encodedData = Base64.getEncoder()
                                                .encodeToString(responseData.getBytes(StandardCharsets.UTF_8));
                                        emitter.send(SseEmitter.event().name("message").data(encodedData));
                                    }
                                } catch (IOException e) {
                                    logger.error("IOException while sending chunk of sample story text: {}", e);
                                    emitter.send(SseEmitter.event().name("complete").data("completeWithError"));
                                    emitter.completeWithError(e);
                                }
                            });
                    logger.info("Response from GPT-4: {}", generatedSample.toString());
                    sampleService.addNewSampleToPlot(userId, plotId, sampleFormat, generatedSample.toString());
                    try {
                        emitter.send(SseEmitter.event().name("complete").data("complete"));
                        emitter.complete();
                    } catch (IOException e) {
                        logger.error("IOException while sending completion event: {}", e);
                        emitter.completeWithError(e);
                    }
                } catch (Exception e) {
                    logger.error("Exception while streaming new story sample: {}", e);
                    emitter.completeWithError(e);
                }
            }
        });

        executor.shutdown();
        return emitter;
    }

    private String createPrompt(String sampleFormat, Plot plot) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(
                "\nWrite a half a page sample for one of the more interesting moments in this story in '")
                .append(increaseSampleFormatPrecision(sampleFormat)).append("' format. ")
                .append("{")
                .append("'genre':'" + plot.getGenre() + "',")
                .append("'title':'" + plot.getTitle() + "',")
                .append("'description':'" + plot.getDescription() + "'")
                .append("}")
                .append("\nIt should be a fragment of a story, not resembling a complete story,")
                .append("\nstarting in the middle of the action, and ending with a cliffhanger.\n");
        return prompt.toString();
    }

    private String increaseSampleFormatPrecision(String sampleFormat) {
        // if sample format is "Correspondence", then return "Correspondence, as in
        // email, letter, online chat, etc."
        if (sampleFormat.equals("Correspondence")) {
            return "Correspondence (e.g. email, letter)";
        }
        return sampleFormat;
    }
}
