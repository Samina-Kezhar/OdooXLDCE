package com.odoo.globetrotter.dto;

import com.odoo.globetrotter.model.Activity;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ActivityResponse {
    private Long id;
    private String name;
    private String description;
    private String type;
    private BigDecimal estimatedCost;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public ActivityResponse(Activity activity) {
        this.id = activity.getId();
        this.name = activity.getName();
        this.description = activity.getDescription();
        this.type = activity.getType();
        this.estimatedCost = activity.getEstimatedCost();
        this.startTime = activity.getStartTime();
        this.endTime = activity.getEndTime();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getType() { return type; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
}
