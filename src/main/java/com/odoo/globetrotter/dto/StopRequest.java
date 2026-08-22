package com.odoo.globetrotter.dto;

import java.time.LocalDate;

public class StopRequest {
    private String cityName;
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
