package com.project.esg.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("report")
public class ReportDto {
    private Integer reportId;
    private Integer userId;
    private Integer targetId  ;
    private String reason   ;
    private String  status ;
    private String adminNote  ;
    private Integer  processed_by ;
    private String reportType   ;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String titleName;
    private String loginId;
}
