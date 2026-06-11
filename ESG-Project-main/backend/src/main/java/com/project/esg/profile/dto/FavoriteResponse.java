package com.project.esg.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class FavoriteResponse {
    boolean result;
    private String description;
    private Long userId;
    private Long targetUserId;

    public FavoriteResponse(String description) {
        this.description = description;
    }

    public FavoriteResponse(boolean result) {
        this.result = result;
    }
}

