package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("template_center_nav")
public class TemplateCenterNav {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private String icon;
    private String linkType;
    private String linkValue;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
