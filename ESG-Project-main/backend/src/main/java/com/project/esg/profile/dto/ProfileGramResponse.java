package com.project.esg.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProfileGramResponse {
    private Long GramId;
    private String title;
    private LocalDateTime createdAt;
}
