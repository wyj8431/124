package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("template_filter_option")
public class TemplateFilterOption {
    @TableId(type = IdType.AUTO) private Long id;
    private String groupCode;
    private String name;
    private String code;
    private String matchType;
    private String matchValue;
    private Integer sortOrder;
    private Integer status;
}
