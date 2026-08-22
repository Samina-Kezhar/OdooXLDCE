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
    private int stopCount;
    private boolean isPublic;
    private String shareToken; // Only non-null when the trip is shared

    public TripResponse(Trip trip) {
        this.id = trip.getId();
        this.name = trip.getName();
        this.description = trip.getDescription();
        this.startDate = trip.getStartDate();
        this.endDate = trip.getEndDate();
        this.coverPhoto = trip.getCoverPhoto();
        this.stopCount = trip.getStops() != null ? trip.getStops().size() : 0;
        this.isPublic = trip.isPublic();
        this.shareToken = trip.isPublic() ? trip.getShareToken() : null;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getCoverPhoto() { return coverPhoto; }
    public int getStopCount() { return stopCount; }
    public boolean isPublic() { return isPublic; }
    public String getShareToken() { return shareToken; }
}
