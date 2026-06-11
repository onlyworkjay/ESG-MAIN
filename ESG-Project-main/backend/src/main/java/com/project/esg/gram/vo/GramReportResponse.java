package com.project.esg.gram.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
// 굳이 gram vo가 있는데도 이 클래스를 다시 만드는 이유
//-> 기존gram vo는 후기 작성을 위한 클래스.
//-> 그러나 이건 신고한 이후 이 회원의 번호 내용 제목등을 가져오기 위한 목적이다.
//-> 따라서 변수명은 같을지라도 그 역할이 다름
public class GramReportResponse {
    private Integer reportId;    // 신고 번호
    private Integer userId;      // 신고한 유저 번호
    private Integer gramId;      // 신고된 후기 번호
    private String gramTitle;    // 후기 제목 (조인해서 가져올 값)
    private String reason;       // 신고 사유
    private String status;       // 처리 상태 (pending, PROCESSED 등)
    private String createdAt;    // 신고 접수일
}
