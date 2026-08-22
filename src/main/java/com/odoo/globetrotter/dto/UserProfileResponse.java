package com.odoo.globetrotter.dto;

import com.odoo.globetrotter.model.User;

public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;

    public UserProfileResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}
