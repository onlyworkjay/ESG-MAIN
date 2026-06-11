package com.project.esg.post.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@Data
@Alias(value = "PostResponse")

public class PostResponse<T> {
    private boolean result;
    private String message;
    private T data;
    private boolean isLike;
    private boolean isReport;

    //매개변수 2개만 사용하는 생성자
    public PostResponse(boolean result, String message) {
        this.result = result;
        this.message = message;
    }

    //매개변수 3개만 사용하는 생성자
    public PostResponse(boolean result, String message, T data) {
        this.result = result;
        this.message = message;
        this.data = data;

    }

    public PostResponse(boolean result, String message, T data, boolean isLike, boolean isReport) {
        this.result = result;
        this.message = message;
        this.data = data;
        this.isLike = isLike;
        this.isReport = isReport;
    }


}