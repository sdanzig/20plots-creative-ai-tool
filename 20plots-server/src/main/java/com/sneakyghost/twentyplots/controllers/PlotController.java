package com.sneakyghost.twentyplots.controllers;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.db.PlotRepository;
import com.sneakyghost.twentyplots.dtos.PlotGenerationRequest;
import com.sneakyghost.twentyplots.entities.Plot;
import com.sneakyghost.twentyplots.entities.PlotAnnouncement;
import com.sneakyghost.twentyplots.entities.SelectedElement;
import com.sneakyghost.twentyplots.services.PlotService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/plots")
public class PlotController {
    private static final Logger logger = LoggerFactory.getLogger(PlotController.class);

    @Autowired
    private PlotRepository plotRepository;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private PlotService plotService;

    @PostMapping
    public ResponseEntity<Plot> savePlot(@RequestHeader("Authorization") String token, @RequestBody Plot newPlot) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        return ResponseEntity.ok(plotService.savePlot(newPlot, userId));
    }    

    @PostMapping("/generate")
    public ResponseEntity<String> generatePlotAsync(@RequestHeader("Authorization") String token,
            @RequestParam String genre,
            @RequestBody(required = false) PlotGenerationRequest requestData) {
    
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        if (userId == null) {
            logger.error("generate - Invalid or missing user ID in token");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or missing user ID in token");
        }
        List<SelectedElement> plotSelectedElements = plotService.selectElements(requestData);
        plotService.generatePlot(userId, genre, plotSelectedElements);
        return ResponseEntity.ok("Plot generation in progress");
    }    

    @PostMapping("/announcements")
    public ResponseEntity<List<PlotAnnouncement>> retrieveNewlyGeneratedPlots(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        if (userId == null) {
            logger.error("retrieveNewlyGeneratedPlots - Invalid or missing user ID in token");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or missing user ID in token");
        }
        List<PlotAnnouncement> newPlotsToAnnounce = plotService.retrieveAndRemovePlotAnnouncements(userId);
        return ResponseEntity.ok(newPlotsToAnnounce);
    }

    @GetMapping
    public ResponseEntity<List<Plot>> getAllPlots(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        if (userId == null) {
            logger.error("getAllPlots - Invalid or missing user ID in token");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or missing user ID in token");
        }
        List<Plot> plots = plotRepository.findByUserId(userId);
        return ResponseEntity.ok(plots);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Plot> deletePlot(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        if (userId == null) {
            logger.error("deletePlot - Invalid or missing user ID in token");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or missing user ID in token");
        }
        if (!plotService.isPlotExists(id, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Plot not found");
        }
        try {
            plotService.deletePlot(id, userId);
        } catch (Exception e) {
            logger.error("deletePlot - Error deleting plot with ID {} for user {}", id, userId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting plot");
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
