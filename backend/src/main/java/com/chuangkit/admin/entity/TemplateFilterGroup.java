package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("template_filter_group")
public class TemplateFilterGroup {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private Integer sortOrder;
    private Integer status;
}
