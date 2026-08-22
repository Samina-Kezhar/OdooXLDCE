package com.odoo.globetrotter.controller;

import com.odoo.globetrotter.dto.ActivityRequest;
import com.odoo.globetrotter.dto.ActivityResponse;
import com.odoo.globetrotter.model.Activity;
import com.odoo.globetrotter.model.Stop;
import com.odoo.globetrotter.model.User;
import com.odoo.globetrotter.repository.ActivityRepository;
import com.odoo.globetrotter.repository.StopRepository;
import com.odoo.globetrotter.repository.UserRepository;
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
@RequestMapping("/api/stops/{stopId}/activities")
public class ActivityController {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private StopRepository stopRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private boolean isStopOwner(Stop stop, User user) {
        return stop.getTrip().getUser().getId().equals(user.getId());
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getActivities(@PathVariable Long stopId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Optional<Stop> stopOpt = stopRepository.findById(stopId);

        if (stopOpt.isEmpty() || !isStopOwner(stopOpt.get(), user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Activity> activities = activityRepository.findByStopIdOrderByStartTimeAsc(stopId);
        List<ActivityResponse> response = activities.stream().map(ActivityResponse::new).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ActivityResponse> addActivity(@PathVariable Long stopId, @RequestBody ActivityRequest request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Optional<Stop> stopOpt = stopRepository.findById(stopId);

        if (stopOpt.isEmpty() || !isStopOwner(stopOpt.get(), user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Activity activity = new Activity();
        activity.setName(request.getName());
        activity.setDescription(request.getDescription());
        activity.setType(request.getType());
        activity.setEstimatedCost(request.getEstimatedCost());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setStop(stopOpt.get());

        Activity savedActivity = activityRepository.save(activity);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ActivityResponse(savedActivity));
    }

    @DeleteMapping("/{activityId}")
    public ResponseEntity<?> deleteActivity(@PathVariable Long stopId, @PathVariable Long activityId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Optional<Stop> stopOpt = stopRepository.findById(stopId);

        if (stopOpt.isEmpty() || !isStopOwner(stopOpt.get(), user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return activityRepository.findById(activityId)
                .map(activity -> {
                    if (!activity.getStop().getId().equals(stopId)) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                    }
                    activityRepository.delete(activity);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
