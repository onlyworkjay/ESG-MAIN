package com.project.esg.choice.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChoiceCreateRow {
    private String choiceGroupId;
    private Long userId;
    private Long productId;
    private Integer gramWritten;
    private Integer isSelected;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
