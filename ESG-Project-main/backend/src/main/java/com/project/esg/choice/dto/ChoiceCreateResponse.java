package com.project.esg.choice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChoiceCreateResponse {
    // 선택된 메뉴 행의 PK입니다. 프론트는 이 값으로 /choice/{choiceId}에 이동합니다.
    private Long choiceId;

    // 같은 선택 흐름에 묶인 후보 메뉴들을 구분하는 UUID입니다.
    private String choiceGroupId;
}
