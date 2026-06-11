package com.project.esg.choice.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChoiceCreateRequest {
    // 선택을 확정한 로그인 회원 id입니다.
    private Long userId;

    // 최종으로 고른 상품 id입니다. 이 상품만 choices.is_selected = 1로 저장합니다.
    private Long selectedProductId;

    // 비교 후보로 화면에 올라와 있던 상품 목록입니다.
    private List<ChoiceCreateItem> items;
}
