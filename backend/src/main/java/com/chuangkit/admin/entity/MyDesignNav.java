package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("my_design_nav")
public class MyDesignNav {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private String icon;
    private String routePath;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
