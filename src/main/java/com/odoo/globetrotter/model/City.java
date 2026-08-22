package com.odoo.globetrotter.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Represents a city in the GlobeTrotter city catalog.
 * Used for the city search/discovery feature.
 */
@Entity
@Table(name = "cities")
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Average daily cost index in USD (approximate) */
    @Column(precision = 10, scale = 2)
    private BigDecimal costIndex;

    /** Popularity score 1-100 */
    private Integer popularity;

    /** URL to a representative image of the city */
    private String imageUrl;

    public City() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getCostIndex() { return costIndex; }
    public void setCostIndex(BigDecimal costIndex) { this.costIndex = costIndex; }

    public Integer getPopularity() { return popularity; }
    public void setPopularity(Integer popularity) { this.popularity = popularity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
