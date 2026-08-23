package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("template_extra_filter_option")
public class TemplateExtraFilterOption {
    @TableId(type = IdType.AUTO) private Long id;
    private String filterCode;
    private String name;
    private String code;
    private String colorHex;
    private String matchType;
    private String matchValue;
    private Integer sortOrder;
    private Integer status;
}
