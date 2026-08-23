package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("create_design_nav")
public class CreateDesignNav {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private String icon;
    private String parentCode;
    private String matchType;
    private String matchValue;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
