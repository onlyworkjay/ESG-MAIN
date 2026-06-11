// 담당자: 장지혁

package com.project.esg.eat.vo;

import lombok.Data;

@Data
public class EatListItem {
    private int page = 1;
    private int size = 15;
    private String order = "like";
    private String brand;
    private String searchKeyword;

    public int getOffset() {
        return (page - 1) * size;
    }
}