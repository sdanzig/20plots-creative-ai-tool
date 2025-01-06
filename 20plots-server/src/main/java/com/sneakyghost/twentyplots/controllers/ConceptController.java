package com.sneakyghost.twentyplots.controllers;

import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.db.ConceptRepository;
import com.sneakyghost.twentyplots.entities.Concept;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/concepts")
public class ConceptController {

    private final ConceptRepository conceptRepository;
    private final JwtProvider jwtProvider;

    public ConceptController(ConceptRepository conceptRepository, JwtProvider jwtProvider) {
        this.conceptRepository = conceptRepository;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping
    public Concept addConcept(@RequestHeader("Authorization") String token, @RequestBody Concept concept) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        concept.setUserId(userId);
        return conceptRepository.save(concept);
    }

    @GetMapping
    public List<Concept> getAllConcepts(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        return conceptRepository.findByUserId(userId);
    }

    @PutMapping("/{id}")
    public Concept updateConcept(@PathVariable Long id, @RequestHeader("Authorization") String token,
            @RequestBody Concept updatedConcept) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        Concept concept = conceptRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Concept not found with id " + id));
        concept.setName(updatedConcept.getName());
        concept.setDescription(updatedConcept.getDescription());
        return conceptRepository.save(concept);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public void deleteConcept(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        conceptRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Concept not found with id " + id));
        conceptRepository.deleteByIdAndUserId(id, userId);
    }
}