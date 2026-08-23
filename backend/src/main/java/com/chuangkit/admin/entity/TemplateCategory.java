package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("template_category")
public class TemplateCategory {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private Long parentId;
    private String icon;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
