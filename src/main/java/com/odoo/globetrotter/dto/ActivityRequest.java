package com.odoo.globetrotter.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ActivityRequest {

    @NotBlank(message = "Activity name is required")
    @Size(max = 255, message = "Activity name must not exceed 255 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    /** E.g., Transport, Stay, Activities, Meals, Other */
    @Pattern(regexp = "^(Transport|Stay|Activities|Meals|Other)$",
             message = "Type must be one of: Transport, Stay, Activities, Meals, Other")
    private String type;

    @DecimalMin(value = "0.00", message = "Cost cannot be negative")
    @DecimalMax(value = "9999999.99", message = "Cost exceeds the maximum allowed value")
    @Digits(integer = 7, fraction = 2, message = "Invalid cost format: max 7 integer digits, 2 decimal places")
    private BigDecimal estimatedCost;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}
