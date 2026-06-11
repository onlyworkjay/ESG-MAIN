// 담당자: 장지혁

package com.project.esg.favorite.controller;

import com.project.esg.favorite.service.FavoriteService;
import com.project.esg.favorite.vo.Favorite;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(value = "*")
@RequestMapping(value = "/favorites")
@RestController
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping // 즐겨찾기 목록 조회
    public ResponseEntity<?> getFavorites(@RequestParam Integer userId) {
        return ResponseEntity.ok(favoriteService.getFavorites(userId));
    }

    @GetMapping("/check/{productId}") // 즐겨찾기 여부 확인
    public ResponseEntity<?> checkFavorite(@PathVariable Integer productId,
                                           @RequestParam Integer userId) {
        return ResponseEntity.ok(favoriteService.checkFavorite(userId, productId));
    }

    @PostMapping // 즐겨찾기 등록
    public ResponseEntity<?> addFavorite(@RequestBody Favorite favorite) {
        return ResponseEntity.ok(favoriteService.addFavorite(favorite));
    }

    @DeleteMapping("/{productId}") // 즐겨찾기 취소
    public ResponseEntity<?> deleteFavorite(@PathVariable Integer productId,
                                            @RequestParam Integer userId) {
        return ResponseEntity.ok(favoriteService.deleteFavorite(userId, productId));
    }
}