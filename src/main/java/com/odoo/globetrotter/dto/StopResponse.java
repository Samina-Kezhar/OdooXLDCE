package com.odoo.globetrotter.dto;

import com.odoo.globetrotter.model.Stop;
import java.time.LocalDate;

public class StopResponse {
    private Long id;
    private String cityName;
    private String country;
    private LocalDate arrivalDate;
    private LocalDate departureDate;
    private Integer orderIndex;

    public StopResponse(Stop stop) {
        this.id = stop.getId();
        this.cityName = stop.getCityName();
        this.country = stop.getCountry();
        this.arrivalDate = stop.getArrivalDate();
        this.departureDate = stop.getDepartureDate();
        this.orderIndex = stop.getOrderIndex();
    }

    public Long getId() { return id; }
    public String getCityName() { return cityName; }
    public String getCountry() { return country; }
    public LocalDate getArrivalDate() { return arrivalDate; }
    public LocalDate getDepartureDate() { return departureDate; }
    public Integer getOrderIndex() { return orderIndex; }
}
