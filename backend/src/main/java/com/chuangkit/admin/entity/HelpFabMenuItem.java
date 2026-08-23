package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("help_fab_menu")
public class HelpFabMenuItem {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private String icon;
    private String linkUrl;
    /** _blank / _self / action */
    private String linkTarget;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
