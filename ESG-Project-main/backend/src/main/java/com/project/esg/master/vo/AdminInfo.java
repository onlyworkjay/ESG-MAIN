package com.project.esg.master.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
//@Alias()
public class AdminInfo {
    private String loginId;
    private String password;
    private String nickname;
    private String email;
}
