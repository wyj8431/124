package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("home_tab")
public class HomeTab {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
}
