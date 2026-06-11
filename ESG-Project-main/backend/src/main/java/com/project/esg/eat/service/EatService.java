// 담당자: 장지혁

package com.project.esg.eat.service;

import com.project.esg.eat.dao.EatDao;
import com.project.esg.eat.vo.Eat;
import com.project.esg.eat.vo.EatListItem;
import com.project.esg.eat.vo.EatListResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.project.esg.global.util.FileUtils;

import java.util.List;
import java.util.Map;

@Service
public class EatService {
    @Autowired
    private EatDao eatDao;

    public EatListResponse selectEatList(EatListItem request) {
        Integer totalCount = eatDao.selectEatCount(request);
        int totalPage = (int) Math.ceil(totalCount / (double) request.getSize());
        List<Eat> list = eatDao.selectEatList(request);

        // 이미지 S3 key → URL 변환 추가
        for (Eat eat : list) {
            if (eat.getImageUrl() != null && !eat.getImageUrl().equals("default.png")) {
                eat.setImageUrl(fileUtil.getFileUrl(eat.getImageUrl()));
            }
        }
        return new EatListResponse(list, totalPage);
    }

    public Eat selectOneEat(Integer productId) {
        Eat eat = eatDao.selectOneEat(productId);
        if (eat != null && eat.getImageUrl() != null && !eat.getImageUrl().equals("default.png")) {
            eat.setImageUrl(fileUtil.getFileUrl(eat.getImageUrl()));
        }
        return eat;
    }

    @Autowired
    private FileUtils fileUtil;

    public List<String> selectBrandNames() {
        return eatDao.selectBrandNames();
    }

    public int insertSuggestion(Integer userId, Integer productId, String userNote) {
        return eatDao.insertSuggestion(userId, productId, userNote);
    }


    //마이페이지에서 제보 내용 표시하기(김경호)
    public List<Map<String, Object>> getMySuggestions(Integer userId) {
        List<Map<String, Object>> list = eatDao.selectMySuggestions(userId);
        System.out.println(list);
        return list;
    }
}
