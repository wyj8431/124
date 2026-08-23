package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("home_section")
public class HomeSection {
    @TableId(type = IdType.AUTO) private Long id;
    private String title;
    private String subtitle;
    private String code;
    private Long categoryId;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
