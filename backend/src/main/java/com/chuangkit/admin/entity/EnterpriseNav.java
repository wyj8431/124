package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("enterprise_nav")
public class EnterpriseNav {
    @TableId(type = IdType.AUTO) private Long id;
    private Long parentId;
    private String name;
    private String code;
    private String routePath;
    private String badgeText;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
