// 담당자: 장지혁

package com.project.esg.eat.controller;

import com.project.esg.eat.service.EatService;
import com.project.esg.eat.vo.EatListItem;
import com.project.esg.eat.vo.EatListResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping(value = "/eats")
public class EatController {
    @Autowired
    private EatService eatService;

    @GetMapping // Eat 페이지 목록
    public ResponseEntity<?> selectEatList(@ModelAttribute EatListItem request){
        EatListResponse response = eatService.selectEatList(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> selectOneEat(@PathVariable Integer productId) {
        return ResponseEntity.ok(eatService.selectOneEat(productId));
    }

    // brand_id 카테고리
    @GetMapping("/brands")
    public ResponseEntity<?> getBrands() {
        List<String> brands = eatService.selectBrandNames();
        return ResponseEntity.ok(brands);
    }

    // 제보하기
    @PostMapping("/suggestions")
    public ResponseEntity<?> insertSuggestion(
            @RequestParam Integer userId,
            @RequestParam Integer productId,
            @RequestParam String userNote) {
        int result = eatService.insertSuggestion(userId, productId, userNote);
        return ResponseEntity.ok(result);
    }

    //제보한 내용 마이페이지에 가져오기 (김경호)
    @GetMapping(value = "/suggestions")
    public ResponseEntity<?> getMySuggestions(@RequestParam Integer userId){
        List<Map<String, Object>> list = eatService.getMySuggestions(userId);
        System.out.println(list);
        return ResponseEntity.ok(list);

    }


}
