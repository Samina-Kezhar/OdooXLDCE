package com.odoo.globetrotter.controller;

import com.odoo.globetrotter.dto.TripRequest;
import com.odoo.globetrotter.dto.TripResponse;
import com.odoo.globetrotter.model.Stop;
import com.odoo.globetrotter.model.Activity;
import com.odoo.globetrotter.model.Trip;
import com.odoo.globetrotter.model.User;
import com.odoo.globetrotter.repository.TripRepository;
import com.odoo.globetrotter.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    // ─── GET all trips for authenticated user ───────────────────────────────────
    @GetMapping
    public ResponseEntity<List<TripResponse>> getUserTrips(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Trip> trips = tripRepository.findByUserId(user.getId());

        List<TripResponse> response = trips.stream()
                .map(TripResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // ─── POST create new trip ────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        Trip trip = new Trip();
        trip.setName(request.getName());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setCoverPhoto(request.getCoverPhoto());
        trip.setUser(user);

        Trip savedTrip = tripRepository.save(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(new TripResponse(savedTrip));
    }

    // ─── GET single trip ─────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getTrip(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return tripRepository.findById(id)
                .map(trip -> {
                    if (!trip.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    return ResponseEntity.ok(new TripResponse(trip));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── PUT update trip ─────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable Long id,
                                        @Valid @RequestBody TripRequest request,
                                        Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return tripRepository.findById(id)
                .map(trip -> {
                    if (!trip.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    trip.setName(request.getName());
                    trip.setDescription(request.getDescription());
                    trip.setStartDate(request.getStartDate());
                    trip.setEndDate(request.getEndDate());
                    trip.setCoverPhoto(request.getCoverPhoto());
                    Trip updatedTrip = tripRepository.save(trip);
                    return ResponseEntity.ok(new TripResponse(updatedTrip));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── DELETE trip ─────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return tripRepository.findById(id)
                .map(trip -> {
                    if (!trip.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    tripRepository.delete(trip);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── POST generate / toggle share link ───────────────────────────────────────
    @PostMapping("/{id}/share")
    public ResponseEntity<?> shareTrip(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return tripRepository.findById(id)
                .map(trip -> {
                    if (!trip.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    // Generate share token if not already shared
                    if (trip.getShareToken() == null) {
                        trip.setShareToken(UUID.randomUUID().toString());
                    }
                    trip.setPublic(true);
                    Trip savedTrip = tripRepository.save(trip);

                    Map<String, Object> response = new HashMap<>();
                    response.put("shareToken", savedTrip.getShareToken());
                    response.put("shareUrl", "/api/shared/" + savedTrip.getShareToken());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── POST revoke share link ───────────────────────────────────────────────────
    @PostMapping("/{id}/unshare")
    public ResponseEntity<?> unshareTrip(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return tripRepository.findById(id)
                .map(trip -> {
                    if (!trip.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    trip.setPublic(false);
                    tripRepository.save(trip);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Trip sharing disabled.");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── GET budget summary ───────────────────────────────────────────────────────
    @GetMapping("/{id}/budget")
    @Transactional(readOnly = true) // Fix: ensures lazy collections can be loaded
    public ResponseEntity<?> getTripBudget(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return tripRepository.findById(id)
                .map(trip -> {
                    if (!trip.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }

                    BigDecimal totalBudget = BigDecimal.ZERO;
                    Map<String, BigDecimal> breakdown = new HashMap<>();

                    for (Stop stop : trip.getStops()) {
                        for (Activity activity : stop.getActivities()) {
                            if (activity.getEstimatedCost() != null) {
                                totalBudget = totalBudget.add(activity.getEstimatedCost());
                                String type = activity.getType() != null ? activity.getType() : "Other";
                                breakdown.merge(type, activity.getEstimatedCost(), BigDecimal::add);
                            }
                        }
                    }

                    Map<String, Object> budgetInfo = new HashMap<>();
                    budgetInfo.put("totalEstimatedCost", totalBudget);
                    budgetInfo.put("costBreakdown", breakdown);

                    return ResponseEntity.ok(budgetInfo);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
