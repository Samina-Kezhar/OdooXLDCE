package com.odoo.globetrotter.dto;

import com.odoo.globetrotter.model.City;
import java.math.BigDecimal;

public class CityResponse {
    private Long id;
    private String name;
    private String country;
    private String description;
    private BigDecimal costIndex;
    private Integer popularity;
    private String imageUrl;

    public CityResponse(City city) {
        this.id = city.getId();
        this.name = city.getName();
        this.country = city.getCountry();
        this.description = city.getDescription();
        this.costIndex = city.getCostIndex();
        this.popularity = city.getPopularity();
        this.imageUrl = city.getImageUrl();
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCountry() { return country; }
    public String getDescription() { return description; }
    public BigDecimal getCostIndex() { return costIndex; }
    public Integer getPopularity() { return popularity; }
    public String getImageUrl() { return imageUrl; }
}
