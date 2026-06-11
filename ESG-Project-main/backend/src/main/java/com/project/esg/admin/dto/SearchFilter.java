package com.project.esg.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class SearchFilter {

    private String searchMenue;
    private Integer searchFilter;
    private String status;
    private Integer brandId;
//    private Integer allergyFilter;
    private String createdAt;
    private Integer page;
    private Integer offSet;
}
