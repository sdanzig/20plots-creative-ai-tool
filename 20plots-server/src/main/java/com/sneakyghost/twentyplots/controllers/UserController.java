package com.sneakyghost.twentyplots.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.slf4j.LoggerFactory;
import org.slf4j.Logger;

import com.sneakyghost.twentyplots.JwtProvider;
import com.sneakyghost.twentyplots.db.RegistrationKeyRepository;
import com.sneakyghost.twentyplots.db.UserRepository;
import com.sneakyghost.twentyplots.dtos.RegistrationRequest;
import com.sneakyghost.twentyplots.entities.RegistrationKey;
import com.sneakyghost.twentyplots.entities.User;

@RestController
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private RegistrationKeyRepository registrationKeyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    @Autowired
    private JwtProvider jwtProvider;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/api/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest registrationRequest) {
        User user = new User(
            registrationRequest.getUsername(),
            registrationRequest.getEmail(),
            registrationRequest.getPassword() // Pre-encrypted
        );
        String registrationKey = registrationRequest.getRegistrationKey();

        // Check for valid registration key
        RegistrationKey regKey = registrationKeyRepository.findByKey(registrationKey);
        if (regKey == null) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Invalid registration key");
        }

        try {
            user.setPassword(user.getPassword(), passwordEncoder);
            User savedUser = userRepository.save(user);

            // Delete the used registration key
            registrationKeyRepository.delete(regKey);
            
            return ResponseEntity.ok(savedUser);
        } catch (DataIntegrityViolationException e) {
            logger.error("Registration error - Username or email might already be in use: username={}, email={} message={}",
                user.getUsername(), user.getEmail(), e.getMessage());
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("A user with the same email already exists");
        }
    }

    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        String username = user.getUsername();
        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null && passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            // Passwords match, return a JWT
            String token = jwtProvider.generateJwtToken(username, existingUser.getId());
            return ResponseEntity.ok().body(token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
