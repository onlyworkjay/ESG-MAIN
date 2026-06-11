package com.project.esg.admin.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("allergy")
public class Allergy {
    private Integer allergyId;
    private String name;
    private Integer productAllergyId;
    private Integer productId;
}
