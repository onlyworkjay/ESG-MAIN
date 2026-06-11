package com.project.esg.post.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value = "ReportDto")


/**
 * 게시글 신고 요청 및 데이터베이스(DAO) 전송용 DTO
 */
public class ReportDto {
    private Long reportId;
    private String reason;      // 프론트엔드(Client)에서 유저가 직접 입력하여 전달하는 값
    private Long postId;        // 서비스 레이어에서 검증 후 URL(@PathVariable)에서 추출해 바인딩
    private Long userId;        // 서비스 레이어에서 검증 후 token에서 추출해 바인딩
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String adminNote;

    /**
     * [프론트엔드 전용 생성자]
     * 'reason' 필드만 매핑하여 객체를 생성할 때 사용합니다.
     */
    public ReportDto(String reason) {
        this.reason = reason;
    }

    /**
     * [서비스/DAO 조회 전용 생성자]
     * 복합키(postId, userId) 조건으로 특정 신고 내역을 DB에서 단건 조회할 때 사용합니다.
     *
     * @param postId 게시글 고유 번호
     * @param userId 신고자 고유 번호
     */
    public ReportDto(Long postId, Long userId) {
        this.postId = postId;
        this.userId = userId;
    }
}