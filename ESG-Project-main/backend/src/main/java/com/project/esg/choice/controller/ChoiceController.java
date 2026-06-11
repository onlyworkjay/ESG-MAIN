package com.project.esg.choice.controller;

import com.project.esg.choice.dto.ChoiceCreateRequest;
import com.project.esg.choice.dto.ChoiceCreateResponse;
import com.project.esg.choice.dto.ChoiceDailyStatusResponse;
import com.project.esg.choice.dto.ChoiceDetailResponse;
import com.project.esg.choice.dto.ProductItemDto;
import com.project.esg.choice.service.ChoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(value = "*")
@RestController
@RequestMapping(value = "/")
public class ChoiceController {
    // Choice 관련 요청을 실제 비즈니스 로직 계층으로 넘기는 서비스입니다.
    // Controller는 HTTP 요청/응답만 담당하고, 데이터 조회 로직은 Service에 맡깁니다.
    @Autowired
    private ChoiceService choiceService;


    @GetMapping(value = "/")
    public ResponseEntity<?> test (){
        System.out.println("백엔드 접속확인");
        return ResponseEntity.ok("김경호화이팅");
    }

    // DB 연결 확인용 테스트 API입니다.
    // ChoiceService -> ChoiceDao -> ChoiceMapper.xml의 select 쿼리까지 호출해 연결 상태를 확인합니다.
    @GetMapping(value = "/test")
    public ResponseEntity<?> test1(){
        String result = choiceService.select();
        System.out.println(result);
        return ResponseEntity.ok(result);
    }

    // 생성자 주입입니다. Spring이 ChoiceService 객체를 만들어 이 Controller에 넣어줍니다.
    public ChoiceController(ChoiceService choiceService) {
        this.choiceService = choiceService;
    }

    // 프론트의 메뉴 탐색/비교하기/랜덤추첨 화면에서 사용하는 전체 상품 메뉴 조회 API입니다.
    // active 상태의 상품 목록을 DTO 리스트로 반환합니다.
    @GetMapping("/api/product-items")
    public List<ProductItemDto> getProductItems() {
        return choiceService.getProductItems();
    }

    // 비교하기 페이지에서 회원이 최종 메뉴를 선택했을 때 호출하는 저장 API입니다.
    // 프론트는 응답받은 choiceId로 /choice/{choiceId} 페이지에 이동합니다.
    @PostMapping("/choices")
    public ResponseEntity<?> createChoice(@RequestBody ChoiceCreateRequest request) {
        try {
            ChoiceCreateResponse response = choiceService.createChoice(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(error.getMessage());
        }
    }

    // "이걸로 선택!" 버튼 클릭 시 모달을 열기 전에 하루 선택 가능 횟수를 확인하는 API입니다.
    @GetMapping("/choices/users/{userId}/daily-status")
    public ResponseEntity<?> getDailyChoiceStatus(@PathVariable Long userId) {
        try {
            ChoiceDailyStatusResponse response = choiceService.getDailyChoiceStatus(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(error.getMessage());
        }
    }

    // 마이페이지에서 로그아웃/재로그인 후에도 최근 선택 이력을 DB 기준으로 다시 조회합니다.
    @GetMapping("/choices/users/{userId}/latest")
    public ResponseEntity<?> getLatestChoice(@PathVariable Long userId) {
        try {
            ChoiceDetailResponse response = choiceService.getLatestChoiceDetail(userId);

            if (response == null) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(error.getMessage());
        }
    }

    // 회원 선택 결과 페이지에서 choiceId 하나로 선택 그룹 전체를 조회합니다.
    @GetMapping("/choices/{choiceId}")
    public ResponseEntity<?> getChoice(@PathVariable Long choiceId) {
        try {
            ChoiceDetailResponse response = choiceService.getChoiceDetail(choiceId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(error.getMessage());
        }
    }
}
