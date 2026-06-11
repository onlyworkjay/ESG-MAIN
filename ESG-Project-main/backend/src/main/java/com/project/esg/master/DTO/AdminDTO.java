package com.project.esg.master.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.ibatis.type.Alias;

import java.sql.Date;
import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@Alias("adminDto")
//@Data 는 toString()까지 같이 끌어오는데,로그 찍을 것 아니라 getter,setter 각각가져옴
public class AdminDTO {
    private String loginId;
    private String nickname;
    private String email;
    private String status;
    private LocalDateTime createdAt;
}
