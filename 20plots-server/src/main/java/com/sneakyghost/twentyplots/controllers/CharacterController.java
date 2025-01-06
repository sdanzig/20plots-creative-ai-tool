package com.sneakyghost.twentyplots.controllers;

import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.db.CharacterRepository;
import com.sneakyghost.twentyplots.entities.Character;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private final CharacterRepository characterRepository;
    private final JwtProvider jwtProvider;

    public CharacterController(CharacterRepository characterRepository, JwtProvider jwtProvider) {
        this.characterRepository = characterRepository;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping
    public Character addCharacter(@RequestHeader("Authorization") String token, @RequestBody Character character) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        character.setUserId(userId);
        return characterRepository.save(character);
    }

    @GetMapping
    public List<Character> getAllCharacters(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        return characterRepository.findByUserId(userId);
    }

    @PutMapping("/{id}")
    public Character updateCharacter(@PathVariable Long id, @RequestHeader("Authorization") String token,
            @RequestBody Character updatedCharacter) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        Character character = characterRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found with id " + id));
        character.setName(updatedCharacter.getName());
        character.setDescription(updatedCharacter.getDescription());
        return characterRepository.save(character);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public void deleteCharacter(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        characterRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found with id " + id));
        characterRepository.deleteByIdAndUserId(id, userId);
    }
}