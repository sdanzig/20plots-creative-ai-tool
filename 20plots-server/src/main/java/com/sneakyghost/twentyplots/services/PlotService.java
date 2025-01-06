package com.sneakyghost.twentyplots.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sneakyghost.twentyplots.RateLimitException;
import com.sneakyghost.twentyplots.controllers.NoElementsCreatedException;
import com.sneakyghost.twentyplots.controllers.NoElementsProvidedException;
import com.sneakyghost.twentyplots.db.PlotRepository;
import com.sneakyghost.twentyplots.db.SampleRepository;
import com.sneakyghost.twentyplots.dtos.PlotGenerationRequest;
import com.sneakyghost.twentyplots.db.AnecdoteRepository;
import com.sneakyghost.twentyplots.db.CharacterRepository;
import com.sneakyghost.twentyplots.db.ConceptRepository;
import com.sneakyghost.twentyplots.db.DreamRepository;
import com.sneakyghost.twentyplots.db.LocationRepository;
import com.sneakyghost.twentyplots.db.PlotAnnouncementRepository;
import com.sneakyghost.twentyplots.entities.Plot;
import com.sneakyghost.twentyplots.entities.SelectedElement;
import com.sneakyghost.twentyplots.entities.Element;
import com.sneakyghost.twentyplots.entities.PlotAnnouncement;
import com.sneakyghost.twentyplots.llm.GPTClient;
import com.sneakyghost.twentyplots.llm.GPTInvalidResponseException;
import com.sneakyghost.twentyplots.llm.GPTPlotResponse;
import com.sneakyghost.twentyplots.llm.ServerOverloadedException;

@Service
public class PlotService {
    private static final Logger logger = LoggerFactory.getLogger(PlotService.class);

    @Autowired
    private PlotRepository plotRepository;

    @Autowired
    private CharacterRepository characterRepository;
    @Autowired
    private ConceptRepository conceptRepository;
    @Autowired
    private AnecdoteRepository anecdoteRepository;
    @Autowired
    private LocationRepository locationRepository;
    @Autowired
    private DreamRepository dreamRepository;

    @Autowired
    private SampleRepository sampleRepository;

    @Autowired
    private PlotAnnouncementRepository plotAnnouncementRepository;

    @Autowired
    private GPTClient gptClient;

    public Optional<Plot> getPlot(Long plotId, Long userId) {
        return plotRepository.findByIdAndUserId(plotId, userId);
    }

    @Async
    public void generatePlot(Long userId, String genre, List<SelectedElement> plotSelectedElements) {
        List<String> elementDescriptions = plotSelectedElements.stream()
                .map(SelectedElement::generateJSON)
                .map(ObjectNode::toString)
                .map(description -> "- " + description) // prepend each description with "- "
                .collect(Collectors.toList());

        StringBuilder prompt = new StringBuilder();
        prompt.append("Write a high-level but interesting plot for a story of the '")
                .append(genre)
                .append("' genre using the following elements:\n")
                .append(String.join("\n", elementDescriptions))
                .append("\nThe plot you write should feel like a coherent story and not disjointed.\n")
                .append("If an element is not important to the resulting plot, take ")
                .append("it out. At least one element must be important to the plot.\n")
                .append("For the description, try to use at least 512 characters, but not if it means ")
                .append("adding anything that isn't important to the story. Do not add 'filler' text.");
        logger.info("Prompt: {}", prompt.toString());

        try {
            GPTPlotResponse gptPlotResponse = gptClient.sendPromptForPlot(prompt.toString());
            Plot plot = createNewPlotFromGPTResponse(gptPlotResponse, userId, genre, plotSelectedElements);

            logger.info("Saving new plot: {}", plot.toString());
            saveAndAnnouncePlot(plot, userId);
        } catch (ServerOverloadedException e) {
            logger.error("ServerOverloadedException: {}", e.getMessage());
            announcePlotGenerationError(userId, "Sorry, I'm spent! Let me have a coffee break and then try again.");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ServerOverloadedException: " + e.getMessage());
        } catch (GPTInvalidResponseException e) {
            logger.error("GPTInvalidResponseException: ", e);
            announcePlotGenerationError(userId, "Eh, what I wrote is crap. Not showing you this one, sorry.");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "GPTInvalidResponseException: " + e.getMessage());
        } catch (RateLimitException e) {
            logger.error("RateLimitException: {}", e.getMessage());
            announcePlotGenerationError(userId,
                    "We're getting a bit too trigger happy generating plots! Let's slow up.");
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "RateLimitException: " + e.getMessage());
        }
    }

    public List<SelectedElement> selectElements(PlotGenerationRequest requestData) {
        List<SelectedElement> plotSelectedElements = null;

        if (requestData != null && requestData.getUseCurrentElements()) {
            if (!requestData.getSelectedElements().isEmpty()) {
                plotSelectedElements = requestData.getSelectedElements();
            } else {
                throw new NoElementsProvidedException();
            }
        } else {
            List<Element> allElements = combineAllElements();
            if (allElements.isEmpty()) {
                logger.info("User tried to generate a plot without adding any elements.");
                throw new NoElementsCreatedException();
            }
            Collections.shuffle(allElements);
            int elementCount = Math.min(allElements.size(), new Random().nextInt(3) + 2);
            plotSelectedElements = allElements.subList(0, elementCount).stream()
                    .map(element -> new SelectedElement(element.getName(), element.getDescription(), element.getType(),
                            element.getUserId()))
                    .collect(Collectors.toList());
        }

        return plotSelectedElements;
    }

    private List<Element> combineAllElements() {
        List<Element> allElements = new ArrayList<>();
        allElements.addAll(characterRepository.findAll());
        allElements.addAll(conceptRepository.findAll());
        allElements.addAll(anecdoteRepository.findAll());
        allElements.addAll(locationRepository.findAll());
        allElements.addAll(dreamRepository.findAll());
        return allElements;
    }

    private void announcePlotGenerationError(Long userId, String message) {
        plotAnnouncementRepository.save(new PlotAnnouncement(userId, null, message));
    }

    @Transactional
    private void saveAndAnnouncePlot(Plot plot, Long userId) {
        plotRepository.save(plot);
        plotAnnouncementRepository.save(new PlotAnnouncement(userId, plot));
    }

    @Transactional
    public List<PlotAnnouncement> retrieveAndRemovePlotAnnouncements(Long userId) {
        List<PlotAnnouncement> plotAnnouncements = plotAnnouncementRepository
                .findByUserId(userId);
        plotAnnouncementRepository.deleteByUserId(userId);
        return plotAnnouncements;
    }

    public boolean isPlotExists(Long plotId, Long userId) {
        return plotRepository.existsByIdAndUserId(plotId, userId);
    }

    public Plot savePlot(Plot newPlot, Long userId) {
        newPlot.setUserId(userId);
        newPlot.setCreated(LocalDateTime.now());
        return plotRepository.save(newPlot);
    }

    @Transactional
    public void deletePlot(Long id, Long userId) {
        // Clear up any pending plot announcements that may exist for this plot
        plotAnnouncementRepository.deleteByPlotIdAndUserId(id, userId);
        sampleRepository.deleteByUserIdAndPlotId(userId, id);
        plotRepository.deleteByIdAndUserId(id, userId);
    }

    private Plot createNewPlotFromGPTResponse(GPTPlotResponse gptPlotResponse, Long userId, String genre,
            List<SelectedElement> plotSelectedElements) {
        Plot plot = new Plot();
        plot.setTitle(gptPlotResponse.getTitle());
        plot.setDescription(gptPlotResponse.getDescription());
        plot.setGenre(genre);
        // filter out elements that are not in the response
        List<SelectedElement> elementsKeptInByGPT = filterOutExcludedElements(plotSelectedElements,
                gptPlotResponse);
        plot.setSelectedElements(elementsKeptInByGPT);
        plot.setCreated(LocalDateTime.now());
        plot.setUserId(userId);
        return plot;
    }

    private List<SelectedElement> filterOutExcludedElements(List<SelectedElement> plotSelectedElements,
            GPTPlotResponse gptPlotResponse) {
        if (gptPlotResponse.getSelectedElements() == null) {
            return Collections.emptyList();
        }
        return plotSelectedElements.stream()
                .filter(
                        element -> gptPlotResponse.getSelectedElements()
                                .contains(element.getName()))
                .collect(Collectors.toList());
    }
}
