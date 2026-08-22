package com.odoo.globetrotter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class StopRequest {

    @NotBlank(message = "City name is required")
    @Size(max = 255, message = "City name must not exceed 255 characters")
    private String cityName;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    private LocalDate arrivalDate;
    private LocalDate departureDate;
    private Integer orderIndex;

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public LocalDate getArrivalDate() { return arrivalDate; }
    public void setArrivalDate(LocalDate arrivalDate) { this.arrivalDate = arrivalDate; }

    public LocalDate getDepartureDate() { return departureDate; }
    public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
