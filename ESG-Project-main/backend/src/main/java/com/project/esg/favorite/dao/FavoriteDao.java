// 담당자: 장지혁

package com.project.esg.favorite.dao;

import com.project.esg.favorite.vo.Favorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FavoriteDao {

    List<Favorite> getFavorites(Integer userId);

    int checkFavorite(@Param("userId") Integer userId,
                      @Param("productId") Integer productId);

    int addFavorite(Favorite favorite);

    int deleteFavorite(@Param("userId") Integer userId,
                       @Param("productId") Integer productId);
}