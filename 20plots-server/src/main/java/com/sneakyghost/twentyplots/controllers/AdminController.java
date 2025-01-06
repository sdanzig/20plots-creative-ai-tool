package com.sneakyghost.twentyplots.controllers;

import com.sneakyghost.twentyplots.services.AdminService;
import com.sneakyghost.twentyplots.dtos.AiQueryRequest;
import com.sneakyghost.twentyplots.dtos.DbQueryRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<Boolean> isAdmin(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(adminService.isAdmin(token));
    }

    @PostMapping("/ai")
    public ResponseEntity<String> sendAiQuery(@RequestHeader("Authorization") String token, @RequestBody AiQueryRequest request) throws Exception {
        return ResponseEntity.ok(adminService.sendAiQuery(token, request));
    }

    @PostMapping("/db")
    public ResponseEntity<String> sendDbQuery(@RequestHeader("Authorization") String token, @RequestBody DbQueryRequest request) throws Exception {
        return ResponseEntity.ok(adminService.sendDbQuery(token, request));
    }
}
