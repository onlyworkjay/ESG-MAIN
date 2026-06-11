package com.project.esg.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@NoArgsConstructor
@Getter
@Setter
public class MenueReport {
    private Integer suggestionId;
    private Integer userId;
    private Integer productId  ;
    private String  userNote;
    private String  status;
    private LocalDate  createdAt;
    private LocalDate completedAt;
    private String  adminNote;
    private Integer  processedBy;
    private String name;
    private String loginId;
}
