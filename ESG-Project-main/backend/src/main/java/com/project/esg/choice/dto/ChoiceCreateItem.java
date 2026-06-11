package com.project.esg.choice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChoiceCreateItem {
    // 비교하기 화면에서 선택 후보로 담겨 있던 상품 id입니다.
    private Long productId;

    // 화면에서 보이던 비교 카드 순서입니다.
    private Integer displayOrder;
}
