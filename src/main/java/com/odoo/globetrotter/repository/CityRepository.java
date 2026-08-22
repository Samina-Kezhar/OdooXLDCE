package com.odoo.globetrotter.repository;

import com.odoo.globetrotter.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {

    /**
     * Search cities by name containing the given string (case-insensitive),
     * optionally filtered by country.
     */
    List<City> findByNameContainingIgnoreCaseAndCountryContainingIgnoreCase(String name, String country);

    /** Find all cities in a given country (case-insensitive) */
    List<City> findByCountryContainingIgnoreCase(String country);

    /** Find all cities whose name contains the given string (case-insensitive) */
    List<City> findByNameContainingIgnoreCase(String name);

    /** Return cities ordered by popularity descending (for default/browse view) */
    List<City> findAllByOrderByPopularityDesc();
}
