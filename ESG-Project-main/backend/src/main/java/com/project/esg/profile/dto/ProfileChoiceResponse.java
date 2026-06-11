package com.project.esg.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProfileChoiceResponse {
    private Long choiceId;
    private String productName;
    private LocalDateTime createdAt;

}
