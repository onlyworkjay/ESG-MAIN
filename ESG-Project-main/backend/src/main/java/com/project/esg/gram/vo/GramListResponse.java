// 담당자: 장지혁

package com.project.esg.gram.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class GramListResponse {
    private List<?> items;
    private Integer totalPage;
}
