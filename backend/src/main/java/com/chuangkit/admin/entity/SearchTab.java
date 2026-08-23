package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("search_tab")
public class SearchTab {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private String placeholder;
    private Integer sortOrder;
    private Integer status;
}
