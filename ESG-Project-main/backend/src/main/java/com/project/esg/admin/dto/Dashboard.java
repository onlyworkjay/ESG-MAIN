package com.project.esg.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@NoArgsConstructor
@Getter
@Setter
public class Dashboard {
    private int allMembers;
    private int newMember;
    private int deletedMember;
    private int allMenues;
    private int allBrands;
    private int pendingReports;
    private List<SuspendDto> getNewReports;
    private int allGrams;
    private int allPosts;
    private List<SuspendDto> getNewUpdates;
}
