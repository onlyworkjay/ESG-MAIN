// 담당자: 장지혁

package com.project.esg.gram.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data

public class GramListItem {
    private int page = 1;
    private int size = 15;
    private Integer status;
    private Integer order;
    private Integer searchType;
    private String searchKeyword;
    private String memberId;
    private Integer userId;
    private Integer offset;
    private Integer productId;
    private String sort = "latest";
}
