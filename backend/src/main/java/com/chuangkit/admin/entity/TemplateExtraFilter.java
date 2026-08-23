package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("template_extra_filter")
public class TemplateExtraFilter {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private Integer sortOrder;
    private Integer status;
}
