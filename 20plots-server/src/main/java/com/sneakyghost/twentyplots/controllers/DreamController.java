package com.sneakyghost.twentyplots.controllers;

import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.db.DreamRepository;
import com.sneakyghost.twentyplots.entities.Dream;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/dreams")
public class DreamController {

    private final DreamRepository dreamRepository;
    private final JwtProvider jwtProvider;

    public DreamController(DreamRepository dreamRepository, JwtProvider jwtProvider) {
        this.dreamRepository = dreamRepository;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping
    public Dream addDream(@RequestHeader("Authorization") String token, @RequestBody Dream dream) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        dream.setUserId(userId);
        return dreamRepository.save(dream);
    }

    @GetMapping
    public List<Dream> getAllDreams(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        return dreamRepository.findByUserId(userId);
    }

    @PutMapping("/{id}")
    public Dream updateDream(@PathVariable Long id, @RequestHeader("Authorization") String token,
            @RequestBody Dream updatedDream) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        Dream dream = dreamRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dream not found with id " + id));
        dream.setName(updatedDream.getName());
        dream.setDescription(updatedDream.getDescription());
        return dreamRepository.save(dream);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public void deleteDream(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        dreamRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dream not found with id " + id));
        dreamRepository.deleteByIdAndUserId(id, userId);
    }
}