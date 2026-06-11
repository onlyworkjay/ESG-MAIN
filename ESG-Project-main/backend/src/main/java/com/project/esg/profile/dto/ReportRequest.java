package com.project.esg.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 프론트에서 reason만 입력받아
 서비스에서 검증후 userId 와 targetUserId를 바인딩해서
 Dao에 요청하는 DTO입니다
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReportRequest {
    private String reason;
    private Long userId;
    private Long targetUserId;

    //신고 작성시 하나만 받는 생성자
    public ReportRequest(String reason) {
        this.reason = reason;
    }

}
