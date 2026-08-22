package com.odoo.globetrotter.dto;

import com.odoo.globetrotter.model.Trip;
import java.time.LocalDate;

public class TripResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String coverPhoto;

    public TripResponse(Trip trip) {
        this.id = trip.getId();
        this.name = trip.getName();
        this.description = trip.getDescription();
        this.startDate = trip.getStartDate();
        this.endDate = trip.getEndDate();
        this.coverPhoto = trip.getCoverPhoto();
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getCoverPhoto() { return coverPhoto; }
}
