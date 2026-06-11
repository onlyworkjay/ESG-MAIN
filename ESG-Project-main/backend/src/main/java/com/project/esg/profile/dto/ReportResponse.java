package com.project.esg.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReportResponse {
    private Long reportId;
    private String reason;
    private String status;
    private LocalDateTime createdAt;

}
