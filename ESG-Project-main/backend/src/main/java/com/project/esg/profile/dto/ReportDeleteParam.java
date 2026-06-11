package com.project.esg.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

/**
 프론트에서 신고 삭제시 reportId와 받는 DTO입니다.
 서비스에서 userId 검증 후 바인딩합니다

 */
public class ReportDeleteParam {
    private Long reportId;
    private Long userId;
    private Long targetUserId;

}
