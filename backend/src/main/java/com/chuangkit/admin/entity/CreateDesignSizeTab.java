package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("create_design_size_tab")
public class CreateDesignSizeTab {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private Integer sortOrder;
    private Integer status;
}
