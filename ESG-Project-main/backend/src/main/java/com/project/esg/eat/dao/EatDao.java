// 담당자: 장지혁

package com.project.esg.eat.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.project.esg.eat.vo.Eat;
import com.project.esg.eat.vo.EatListItem;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EatDao {
    Integer selectEatCount(EatListItem request);

    List<Eat> selectEatList(EatListItem request);

    Eat selectOneEat(Integer productId);

    List<String> selectBrandNames();

    int insertSuggestion(@Param("userId") Integer userId,
                         @Param("productId") Integer productId,
                         @Param("userNote") String userNote);

    //마이페이지에서 제보 내용 표시하기(김경호)
    List<Map<String, Object>> selectMySuggestions(Integer userId);
}
