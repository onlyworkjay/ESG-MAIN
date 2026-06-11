// 담당자: 장지혁

package com.project.esg.gram.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class GramReport {
    private Integer reportId;
    private Integer userId;
    private Integer gramId;
    private String reason;
    private String status;
}