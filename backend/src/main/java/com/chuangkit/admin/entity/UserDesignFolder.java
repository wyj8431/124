package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_design_folder")
public class UserDesignFolder {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String name;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
