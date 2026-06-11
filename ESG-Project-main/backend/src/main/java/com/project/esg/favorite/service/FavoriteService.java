// 담당자: 장지혁

package com.project.esg.favorite.service;

import com.project.esg.favorite.dao.FavoriteDao;
import com.project.esg.favorite.vo.Favorite;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteDao favoriteDao;

    public List<Favorite> getFavorites(Integer userId) {
        return favoriteDao.getFavorites(userId);
    }

    public boolean checkFavorite(Integer userId, Integer productId) {
        return favoriteDao.checkFavorite(userId, productId) > 0;
    }

    public int addFavorite(Favorite favorite) {
        return favoriteDao.addFavorite(favorite);
    }

    public int deleteFavorite(Integer userId, Integer productId) {
        return favoriteDao.deleteFavorite(userId, productId);
    }
}