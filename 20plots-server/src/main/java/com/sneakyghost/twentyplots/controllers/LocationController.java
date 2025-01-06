package com.sneakyghost.twentyplots.controllers;

import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.db.LocationRepository;
import com.sneakyghost.twentyplots.entities.Location;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationRepository locationRepository;
    private final JwtProvider jwtProvider;

    public LocationController(LocationRepository locationRepository, JwtProvider jwtProvider) {
        this.locationRepository = locationRepository;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping
    public Location addLocation(@RequestHeader("Authorization") String token, @RequestBody Location location) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        location.setUserId(userId);
        return locationRepository.save(location);
    }

    @GetMapping
    public List<Location> getAllLocations(@RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        return locationRepository.findByUserId(userId);
    }

    @PutMapping("/{id}")
    public Location updateLocation(@PathVariable Long id, @RequestHeader("Authorization") String token,
            @RequestBody Location updatedLocation) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        Location location = locationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found with id " + id));
        location.setName(updatedLocation.getName());
        location.setDescription(updatedLocation.getDescription());
        return locationRepository.save(location);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public void deleteLocation(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        token = token.replace("Bearer ", "");
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        locationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found with id " + id));
        locationRepository.deleteByIdAndUserId(id, userId);
    }
}