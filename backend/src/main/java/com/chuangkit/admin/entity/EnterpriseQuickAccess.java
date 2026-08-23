package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("enterprise_quick_access")
public class EnterpriseQuickAccess {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private String description;
    private String icon;
    private String routePath;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
