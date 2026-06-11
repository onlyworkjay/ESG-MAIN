package com.project.esg.choice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChoiceDailyStatusResponse {
    // 하루 선택 가능 최대 횟수입니다.
    private int limit;

    // 오늘 이미 확정한 선택 횟수입니다.
    private int usedCount;

    // 오늘 남은 선택 가능 횟수입니다.
    private int remainingCount;

    // 더 이상 선택할 수 없는 상태인지 프론트에서 바로 판단할 수 있게 내려줍니다.
    private boolean limitReached;
}
