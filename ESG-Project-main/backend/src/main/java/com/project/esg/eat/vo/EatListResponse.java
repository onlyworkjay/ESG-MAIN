// 담당자: 장지혁

package com.project.esg.eat.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class EatListResponse {
    private List<Eat> items;  // <?> → <Eat>
    private int totalPage;
}