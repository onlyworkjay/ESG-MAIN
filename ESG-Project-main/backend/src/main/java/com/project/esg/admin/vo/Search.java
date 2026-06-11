package com.project.esg.admin.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Search {
    private Integer page;
    private String searchMember;
    private Integer userFilter;
    private Integer orderBy;
    private Integer size;
    private Integer offset;
    private Integer searchFilter;
}
