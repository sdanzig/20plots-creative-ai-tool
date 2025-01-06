package com.sneakyghost.twentyplots.controllers;

import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.db.AnecdoteRepository;
import com.sneakyghost.twentyplots.entities.Anecdote;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/anecdotes")
public class AnecdoteController {

    private final AnecdoteRepository anecdoteRepository;
    private final JwtProvider jwtProvider;

    public AnecdoteController(AnecdoteRepository anecdoteRepository, JwtProvider jwtProvider) {
        this.anecdoteRepository = anecdoteRepository;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping
    public Anecdote addAnecdote(@RequestHeader("Authorization") String token, @RequestBody Anecdote anecdote) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        anecdote.setUserId(userId);
        return anecdoteRepository.save(anecdote);
    }

    @GetMapping
    public List<Anecdote> getAllAnecdotes(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        return anecdoteRepository.findByUserId(userId);
    }

    @PutMapping("/{id}")
    public Anecdote updateAnecdote(@PathVariable Long id, @RequestHeader("Authorization") String token,
            @RequestBody Anecdote updatedAnecdote) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        Anecdote anecdote = anecdoteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anecdote not found with id " + id));
        anecdote.setName(updatedAnecdote.getName());
        anecdote.setDescription(updatedAnecdote.getDescription());
        return anecdoteRepository.save(anecdote);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public void deleteAnecdote(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        anecdoteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anecdote not found with id " + id));
        anecdoteRepository.deleteByIdAndUserId(id, userId);
    }
}