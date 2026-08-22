package com.odoo.globetrotter.controller;

import com.odoo.globetrotter.dto.CityResponse;
import com.odoo.globetrotter.model.City;
import com.odoo.globetrotter.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * City catalog/search API.
 * GET /api/cities?search=&country= — search cities for trip planning.
 */
@RestController
@RequestMapping("/api/cities")
public class CityController {

    @Autowired
    private CityRepository cityRepository;

    /**
     * Search cities.
     * - No params: returns all cities sorted by popularity
     * - ?search=Paris: search by name
     * - ?country=France: filter by country
     * - ?search=Par&country=France: combined filter
     */
    @GetMapping
    public ResponseEntity<List<CityResponse>> searchCities(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "") String country) {

        List<City> cities;

        boolean hasSearch = !search.isBlank();
        boolean hasCountry = !country.isBlank();

        if (hasSearch && hasCountry) {
            cities = cityRepository.findByNameContainingIgnoreCaseAndCountryContainingIgnoreCase(search, country);
        } else if (hasSearch) {
            cities = cityRepository.findByNameContainingIgnoreCase(search);
        } else if (hasCountry) {
            cities = cityRepository.findByCountryContainingIgnoreCase(country);
        } else {
            cities = cityRepository.findAllByOrderByPopularityDesc();
        }

        List<CityResponse> response = cities.stream()
                .map(CityResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get a single city by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CityResponse> getCityById(@PathVariable Long id) {
        return cityRepository.findById(id)
                .map(city -> ResponseEntity.ok(new CityResponse(city)))
                .orElse(ResponseEntity.notFound().build());
    }
}
