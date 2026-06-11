package com.project.esg.choice.dao;


import com.project.esg.choice.dto.ProductItemDto;
import com.project.esg.choice.dto.ChoiceCreateRow;
import com.project.esg.choice.dto.ChoiceDetailItemDto;
import com.project.esg.choice.dto.ChoiceDetailResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChoiceDao {

    // ChoiceMapper.xml의 id="select" 쿼리와 연결됩니다.
    // 서버와 DB가 정상 연결되어 있는지 확인하는 테스트용 조회입니다.
    String select();

    // ChoiceMapper.xml의 id="selectProductItems" 쿼리와 연결됩니다.
    // product_items와 product_brands를 조인해서 화면에 필요한 메뉴 목록을 가져옵니다.
    List<ProductItemDto> selectProductItems();

    // 선택 확정 시 choices 테이블에 비교 후보 메뉴들을 같은 choice_group_id로 저장합니다.
    void upsertChoice(ChoiceCreateRow row);

    // 하루 선택 확정 횟수를 제한하기 위해 오늘 선택된 대표 메뉴 개수를 조회합니다.
    int countTodaySelectedChoices(@Param("userId") Long userId);

    // 선택된 메뉴(is_selected = 1)의 choice_id를 찾아 회원용 선택 결과 페이지 라우팅에 사용합니다.
    Long selectSelectedChoiceId(
            @Param("choiceGroupId") String choiceGroupId,
            @Param("userId") Long userId
    );

    // choice_id 하나로 선택 그룹의 기본 정보를 조회합니다.
    ChoiceDetailResponse selectChoiceHeader(@Param("choiceId") Long choiceId);

    // 사용자의 가장 최근 최종 선택 choice_id를 조회합니다.
    Long selectLatestSelectedChoiceId(@Param("userId") Long userId);

    // 같은 choice_group_id에 속한 메뉴들을 화면 표시 순서대로 조회합니다.
    List<ChoiceDetailItemDto> selectChoiceItems(
            @Param("choiceGroupId") String choiceGroupId,
            @Param("userId") Long userId
    );
}
