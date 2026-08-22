package com.odoo.globetrotter.controller;

import com.odoo.globetrotter.dto.LoginRequest;
import com.odoo.globetrotter.dto.SignupRequest;
import com.odoo.globetrotter.dto.UserProfileResponse;
import com.odoo.globetrotter.model.User;
import com.odoo.globetrotter.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    // ISSUE-19: Simple in-memory rate limiter — max 10 login attempts per IP
    private final Map<String, AtomicInteger> loginAttempts = new ConcurrentHashMap<>();

    // ─── POST /signup ─────────────────────────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // ISSUE-07: normalize email to lowercase
        String email = signUpRequest.getEmail().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error: Email is already in use!");
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(response);
        }

        User user = new User();
        user.setName(signUpRequest.getName().trim());
        user.setEmail(email); // already normalized
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    // ─── POST /login ──────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
                                              HttpServletRequest request, HttpServletResponse response) {
        // ISSUE-19: rate limit by IP
        String ip = request.getRemoteAddr();
        AtomicInteger attempts = loginAttempts.computeIfAbsent(ip, k -> new AtomicInteger(0));
        if (attempts.get() >= 10) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Too many login attempts. Please wait a moment before trying again.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(err);
        }

        // ISSUE-07: normalize email
        String email = loginRequest.getEmail().trim().toLowerCase();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword()));

            // Successful login — reset attempt counter
            loginAttempts.remove(ip);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "User logged in successfully!");
            return ResponseEntity.ok(responseBody);
        } catch (Exception ex) {
            // Increment failure counter
            attempts.incrementAndGet();
            throw ex; // re-throw so GlobalExceptionHandler returns 401
        }
    }

    // ─── POST /logout ─────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "User logged out successfully!");
        return ResponseEntity.ok(response);
    }

    // ─── GET /me — current user profile ──────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(new UserProfileResponse(user));
    }
}
