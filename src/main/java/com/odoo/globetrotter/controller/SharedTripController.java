package com.odoo.globetrotter.controller;

import com.odoo.globetrotter.dto.ActivityResponse;
import com.odoo.globetrotter.dto.StopResponse;
import com.odoo.globetrotter.dto.TripResponse;
import com.odoo.globetrotter.model.Activity;
import com.odoo.globetrotter.model.Stop;
import com.odoo.globetrotter.model.Trip;
import com.odoo.globetrotter.model.User;
import com.odoo.globetrotter.repository.TripRepository;
import com.odoo.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Handles publicly shared trip itineraries.
 * GET /api/shared/{token} is open to everyone (no auth required).
 * POST /api/shared/{token}/copy requires authentication.
 */
@RestController
@RequestMapping("/api/shared")
public class SharedTripController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── GET shared trip — public, no auth required ───────────────────────────────
    @GetMapping("/{token}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getSharedTrip(@PathVariable String token) {
        return tripRepository.findByShareToken(token)
                .map(trip -> {
                    if (!trip.isPublic()) {
                        // Token exists but sharing has been revoked
                        return ResponseEntity.status(HttpStatus.GONE).build();
                    }

                    // Build a detailed read-only response including stops and activities
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", trip.getId());
                    response.put("name", trip.getName());
                    response.put("description", trip.getDescription());
                    response.put("startDate", trip.getStartDate());
                    response.put("endDate", trip.getEndDate());
                    response.put("coverPhoto", trip.getCoverPhoto());

                    List<Map<String, Object>> stopsData = new ArrayList<>();
                    for (Stop stop : trip.getStops()) {
                        Map<String, Object> stopMap = new HashMap<>();
                        stopMap.put("id", stop.getId());
                        stopMap.put("cityName", stop.getCityName());
                        stopMap.put("country", stop.getCountry());
                        stopMap.put("arrivalDate", stop.getArrivalDate());
                        stopMap.put("departureDate", stop.getDepartureDate());
                        stopMap.put("orderIndex", stop.getOrderIndex());

                        List<ActivityResponse> activitiesData = stop.getActivities()
                                .stream()
                                .map(ActivityResponse::new)
                                .collect(Collectors.toList());
                        stopMap.put("activities", activitiesData);
                        stopsData.add(stopMap);
                    }
                    response.put("stops", stopsData);

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── POST copy a shared trip to the authenticated user's account ──────────────
    @PostMapping("/{token}/copy")
    @Transactional
    public ResponseEntity<?> copySharedTrip(@PathVariable String token, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return tripRepository.findByShareToken(token)
                .map(sourceTrip -> {
                    if (!sourceTrip.isPublic()) {
                        return ResponseEntity.status(HttpStatus.GONE).build();
                    }

                    // Deep-copy: create a new Trip owned by the current user
                    Trip newTrip = new Trip();
                    newTrip.setName("Copy of " + sourceTrip.getName());
                    newTrip.setDescription(sourceTrip.getDescription());
                    newTrip.setStartDate(sourceTrip.getStartDate());
                    newTrip.setEndDate(sourceTrip.getEndDate());
                    newTrip.setCoverPhoto(sourceTrip.getCoverPhoto());
                    newTrip.setUser(currentUser);
                    newTrip.setPublic(false); // Copied trip is private by default

                    // Deep-copy stops and activities
                    for (Stop sourceStop : sourceTrip.getStops()) {
                        Stop newStop = new Stop();
                        newStop.setCityName(sourceStop.getCityName());
                        newStop.setCountry(sourceStop.getCountry());
                        newStop.setArrivalDate(sourceStop.getArrivalDate());
                        newStop.setDepartureDate(sourceStop.getDepartureDate());
                        newStop.setOrderIndex(sourceStop.getOrderIndex());
                        newStop.setTrip(newTrip);

                        for (Activity sourceActivity : sourceStop.getActivities()) {
                            Activity newActivity = new Activity();
                            newActivity.setName(sourceActivity.getName());
                            newActivity.setDescription(sourceActivity.getDescription());
                            newActivity.setType(sourceActivity.getType());
                            newActivity.setEstimatedCost(sourceActivity.getEstimatedCost());
                            newActivity.setStartTime(sourceActivity.getStartTime());
                            newActivity.setEndTime(sourceActivity.getEndTime());
                            newActivity.setStop(newStop);
                            newStop.getActivities().add(newActivity);
                        }

                        newTrip.getStops().add(newStop);
                    }

                    Trip savedTrip = tripRepository.save(newTrip);

                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Trip copied successfully!");
                    response.put("trip", new TripResponse(savedTrip));
                    return ResponseEntity.status(HttpStatus.CREATED).body(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
