package com.codefolio.authService.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/public")
    public String publicEndpoint() {
        return "Public endpoint - no authentication required";
    }

    @GetMapping("/private")
    public String privateEndpoint() {
        return "Private endpoint - authentication required";
    }
} 