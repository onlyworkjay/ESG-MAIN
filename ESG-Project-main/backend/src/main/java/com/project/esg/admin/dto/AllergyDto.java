package com.project.esg.admin.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@Getter
@Setter
@Data
@Alias("allergydto")
public class AllergyDto {
    private String allergyName;
    private Integer allergyId;
    private Integer productAllergyId;
}
