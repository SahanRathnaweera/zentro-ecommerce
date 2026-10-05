package com.zentro.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {
    @GetMapping("/me")
    public String me(Authentication authentication) {
        return "Hello " + authentication.getName() + " " + authentication.getAuthorities();
    }

    // Needs an ADMIN (matched by /api/admin/** in SecurityConfig)
    @GetMapping("/admin/ping")
    public String adminPing() {
        return "Hello admin";
    }
}
