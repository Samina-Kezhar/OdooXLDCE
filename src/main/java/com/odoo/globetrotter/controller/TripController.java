package com.odoo.globetrotter.controller;

import com.odoo.globetrotter.dto.TripRequest;
import com.odoo.globetrotter.dto.TripResponse;
import com.odoo.globetrotter.model.Trip;
import com.odoo.globetrotter.model.User;
import com.odoo.globetrotter.repository.TripRepository;
import com.odoo.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @GetMapping
    public ResponseEntity<List<TripResponse>> getUserTrips(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Trip> trips = tripRepository.findByUserId(user.getId());
        
        List<TripResponse> response = trips.stream()
                .map(TripResponse::new)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@RequestBody TripRequest request, Authentication authentication) {
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

    @GetMapping("/{id}/budget")
    public ResponseEntity<?> getTripBudget(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        
        return tripRepository.findById(id)
                .map(trip -> {
                    if (!trip.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    
                    BigDecimal totalBudget = BigDecimal.ZERO;
                    Map<String, BigDecimal> breakdown = new HashMap<>();
                    
                    for (var stop : trip.getStops()) {
                        for (var activity : stop.getActivities()) {
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
