// 담당자: 장지혁

package com.project.esg.gram.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class GramCreateResponse {
    private Integer gramNo;
    private Integer fileCount;
}
