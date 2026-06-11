package com.project.esg.admin.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;


@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("users")
public class Users {
    private Integer userId;
    private String loginId;
    private String  nickname;
    private String  email;
    private String status;
    private String suspensionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private String profileImg;
}
