package com.project.esg.post.dao;

import com.project.esg.post.dto.ReportDto;
import com.project.esg.post.dto.SearchDto;
import com.project.esg.post.vo.Post;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PostDao {
    int insertPost(Post post);

    int insertPostFile(@Param("originalFileName") String originalFileName,
                       @Param("s3Key") String s3Key,
                       @Param("postId") Long postId);


    Post getPostById(long postId);

    List<String> getS3KeysByPostId(long postId);

    void incrementViewCount(long postId);

    int deletePostFile(String s3key, long postId);

    int updatePost(Post post);

    int deletePost(long postId);

    // 좋아요 신고 여부 조회
    Map<String, Object> getStatus(long postId, Long userId);

    int insertLike(@Param("userId") Long userId,
                   @Param("postId") Long postId);

    int deleteLike(@Param("userId") Long userId,
                   @Param("postId") Long postId);


    int insertReport(ReportDto report);

    ReportDto getReport(ReportDto paramDto);

    int deleteReport(ReportDto report);

    Long getPostCount(SearchDto params);

    List<Post> getPostList(SearchDto params);

    List<Post> getPostNoticeList(SearchDto params);
}