package com.project.esg.choice.service;

import com.project.esg.choice.dao.ChoiceDao;
import com.project.esg.choice.dto.ChoiceCreateItem;
import com.project.esg.choice.dto.ChoiceCreateRequest;
import com.project.esg.choice.dto.ChoiceCreateResponse;
import com.project.esg.choice.dto.ChoiceCreateRow;
import com.project.esg.choice.dto.ChoiceDailyStatusResponse;
import com.project.esg.choice.dto.ChoiceDetailItemDto;
import com.project.esg.choice.dto.ChoiceDetailResponse;
import com.project.esg.choice.dto.ProductItemDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ChoiceService {
    private static final int DAILY_CHOICE_LIMIT = 3;

    // MyBatis Mapper 역할을 하는 DAO입니다.
    // Service는 Controller와 DAO 사이에서 조회 흐름을 정리하는 중간 계층입니다.
    @Autowired
    private ChoiceDao choiceDao;


    // DB 연결 확인용 테스트 로직입니다.
    // Controller의 /test 요청이 들어오면 DAO의 select 쿼리를 호출합니다.
    public String select() {
        String result = choiceDao.select();
        return result;
    }

    // 생성자 주입입니다. 테스트 코드 작성과 의존성 관리가 쉬워지는 방식입니다.
    public ChoiceService(ChoiceDao choiceDao) {
        this.choiceDao = choiceDao;
    }

    // 화면에서 필요한 상품 메뉴 목록을 조회합니다.
    // 현재는 별도 가공 없이 DAO 결과를 그대로 반환합니다.
    public List<ProductItemDto> getProductItems() {
        return choiceDao.selectProductItems();
    }

    // 비교하기 화면에서 "이걸로 선택"을 확정한 회원의 선택 기록을 저장합니다.
    // 한 번의 선택 흐름에 포함된 후보 메뉴들은 같은 choice_group_id로 묶고,
    // 실제로 고른 메뉴만 is_selected = 1로 표시합니다.
    public ChoiceCreateResponse createChoice(ChoiceCreateRequest request) {
        validateChoiceCreateRequest(request);
        validateDailyChoiceLimit(request.getUserId());

        String choiceGroupId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        List<ChoiceCreateItem> items = request.getItems();

        for (int i = 0; i < items.size(); i += 1) {
            ChoiceCreateItem item = items.get(i);
            int displayOrder = item.getDisplayOrder() == null
                    ? i + 1
                    : item.getDisplayOrder();
            int isSelected = item.getProductId().equals(request.getSelectedProductId())
                    ? 1
                    : 0;

            ChoiceCreateRow row = ChoiceCreateRow.builder()
                    .choiceGroupId(choiceGroupId)
                    .userId(request.getUserId())
                    .productId(item.getProductId())
                    .gramWritten(0)
                    .isSelected(isSelected)
                    .displayOrder(displayOrder)
                    .createdAt(now)
                    .expiresAt(sevenDaysLater)
                    .build();

            choiceDao.upsertChoice(row);
        }

        Long selectedChoiceId = choiceDao.selectSelectedChoiceId(
                choiceGroupId,
                request.getUserId()
        );

        if (selectedChoiceId == null) {
            throw new IllegalArgumentException("선택된 메뉴 저장 결과를 찾을 수 없습니다.");
        }

        return new ChoiceCreateResponse(selectedChoiceId, choiceGroupId);
    }

    // 사용자가 하루에 선택 확정을 3번 넘게 하지 못하도록 막습니다.
    private void validateDailyChoiceLimit(Long userId) {
        ChoiceDailyStatusResponse dailyStatus = getDailyChoiceStatus(userId);

        if (dailyStatus.isLimitReached()) {
            throw new IllegalArgumentException("하루 선택은 최대 3번까지 가능합니다.");
        }
    }

    // 비교 카드에서 "이걸로 선택!"을 누르기 전에 오늘 선택 가능 여부를 확인하는 데이터입니다.
    // 선택 완료 UI 담당자는 이 응답을 이용해 남은 횟수 안내만 붙이면 됩니다.
    public ChoiceDailyStatusResponse getDailyChoiceStatus(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인 회원 id가 필요합니다.");
        }

        int usedCount = choiceDao.countTodaySelectedChoices(userId);
        int remainingCount = Math.max(DAILY_CHOICE_LIMIT - usedCount, 0);

        return new ChoiceDailyStatusResponse(
                DAILY_CHOICE_LIMIT,
                usedCount,
                remainingCount,
                usedCount >= DAILY_CHOICE_LIMIT
        );
    }

    // choiceId로 선택 결과 페이지에 필요한 후보 메뉴와 최종 선택 메뉴를 조회합니다.
    public ChoiceDetailResponse getChoiceDetail(Long choiceId) {
        ChoiceDetailResponse response = choiceDao.selectChoiceHeader(choiceId);

        if (response == null) {
            throw new IllegalArgumentException("선택 기록을 찾을 수 없습니다.");
        }

        List<ChoiceDetailItemDto> items = choiceDao.selectChoiceItems(
                response.getChoiceGroupId(),
                response.getUserId()
        );

        response.setItems(items);
        return response;
    }

    // 마이페이지에서 로그인한 사용자의 최신 선택 이력을 다시 보여주기 위한 조회입니다.
    // Zustand의 choiceId는 로그아웃 시 초기화되므로, DB에 저장된 최신 선택을 userId로 다시 찾습니다.
    public ChoiceDetailResponse getLatestChoiceDetail(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인 회원 id가 필요합니다.");
        }

        Long latestChoiceId = choiceDao.selectLatestSelectedChoiceId(userId);

        if (latestChoiceId == null) {
            return null;
        }

        return getChoiceDetail(latestChoiceId);
    }

    // 필수 값이 비어 있거나, 최종 선택 상품이 후보 목록에 없으면 저장하지 않습니다.
    private void validateChoiceCreateRequest(ChoiceCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("선택 요청이 비어 있습니다.");
        }

        if (request.getUserId() == null) {
            throw new IllegalArgumentException("로그인 회원 id가 필요합니다.");
        }

        if (request.getSelectedProductId() == null) {
            throw new IllegalArgumentException("선택된 상품 id가 필요합니다.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("선택 후보 상품이 필요합니다.");
        }

        boolean hasSelectedProduct = request.getItems().stream()
                .anyMatch((item) -> request.getSelectedProductId().equals(item.getProductId()));

        if (!hasSelectedProduct) {
            throw new IllegalArgumentException("선택된 상품이 후보 목록에 없습니다.");
        }
    }
}
