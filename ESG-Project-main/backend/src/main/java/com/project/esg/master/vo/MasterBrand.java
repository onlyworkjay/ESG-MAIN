package com.project.esg.master.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("mBrand")
public class MasterBrand {
    private Integer brandId;
    private String brandName;
    private String description;
    private Integer itemCount;
}
