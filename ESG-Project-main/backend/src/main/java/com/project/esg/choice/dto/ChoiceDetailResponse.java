package com.project.esg.choice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ChoiceDetailResponse {
    private Long choiceId;
    private String choiceGroupId;
    private Long userId;
    private Long selectedProductId;
    private Integer gramWritten;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    private List<ChoiceDetailItemDto> items;
}
