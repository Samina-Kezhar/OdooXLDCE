package com.odoo.globetrotter.controller;

import com.odoo.globetrotter.dto.StopRequest;
import com.odoo.globetrotter.dto.StopResponse;
import com.odoo.globetrotter.model.Stop;
import com.odoo.globetrotter.model.Trip;
import com.odoo.globetrotter.model.User;
import com.odoo.globetrotter.repository.StopRepository;
import com.odoo.globetrotter.repository.TripRepository;
import com.odoo.globetrotter.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips/{tripId}/stops")
public class StopController {

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private boolean isTripOwner(Trip trip, User user) {
        return trip.getUser().getId().equals(user.getId());
    }

    // ─── GET all stops for a trip ─────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getStops(@PathVariable Long tripId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Optional<Trip> tripOpt = tripRepository.findById(tripId);

        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build(); // Fix: 404, not 403
        }
        if (!isTripOwner(tripOpt.get(), user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Stop> stops = stopRepository.findByTripIdOrderByOrderIndexAsc(tripId);
        List<StopResponse> response = stops.stream().map(StopResponse::new).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // ─── POST add a stop to a trip ────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> addStop(@PathVariable Long tripId,
                                     @Valid @RequestBody StopRequest request,
                                     Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Optional<Trip> tripOpt = tripRepository.findById(tripId);

        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build(); // Fix: 404, not 403
        }
        if (!isTripOwner(tripOpt.get(), user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Stop stop = new Stop();
        stop.setCityName(request.getCityName());
        stop.setCountry(request.getCountry());
        stop.setArrivalDate(request.getArrivalDate());
        stop.setDepartureDate(request.getDepartureDate());
        stop.setOrderIndex(request.getOrderIndex());
        stop.setTrip(tripOpt.get());

        Stop savedStop = stopRepository.save(stop);
        return ResponseEntity.status(HttpStatus.CREATED).body(new StopResponse(savedStop));
    }

    // ─── PUT update a stop ────────────────────────────────────────────────────────
    @PutMapping("/{stopId}")
    public ResponseEntity<?> updateStop(@PathVariable Long tripId,
                                        @PathVariable Long stopId,
                                        @Valid @RequestBody StopRequest request,
                                        Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Optional<Trip> tripOpt = tripRepository.findById(tripId);

        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (!isTripOwner(tripOpt.get(), user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return stopRepository.findById(stopId)
                .map(stop -> {
                    if (!stop.getTrip().getId().equals(tripId)) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                    }
                    stop.setCityName(request.getCityName());
                    stop.setCountry(request.getCountry());
                    stop.setArrivalDate(request.getArrivalDate());
                    stop.setDepartureDate(request.getDepartureDate());
                    stop.setOrderIndex(request.getOrderIndex());
                    Stop updatedStop = stopRepository.save(stop);
                    return ResponseEntity.ok(new StopResponse(updatedStop));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── DELETE a stop ────────────────────────────────────────────────────────────
    @DeleteMapping("/{stopId}")
    public ResponseEntity<?> deleteStop(@PathVariable Long tripId,
                                        @PathVariable Long stopId,
                                        Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Optional<Trip> tripOpt = tripRepository.findById(tripId);

        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build(); // Fix: 404, not 403
        }
        if (!isTripOwner(tripOpt.get(), user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return stopRepository.findById(stopId)
                .map(stop -> {
                    if (!stop.getTrip().getId().equals(tripId)) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                    }
                    stopRepository.delete(stop);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
