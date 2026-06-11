package com.project.esg.admin.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDate;
import java.time.LocalDateTime;
//vo라고 할걸..
@NoArgsConstructor
@Data
@Alias("suspend")
public class SuspendDto {
    private Integer targetUserId;
    private Integer userId;
    private String suspensionReason;
    private LocalDate endDate;
    private Integer reportId;
    private String adminNote;
    private Integer processedBy;
    private Integer postId;
    private Integer gramId;
    private String reportType;
    private LocalDate createdAt;
    private String status;
    private String loginId;
    private String title;
    private String targetId;
    private String titleName;
}
