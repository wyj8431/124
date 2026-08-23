package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("hot_tag")
public class HotTag {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String emoji;
    private String searchKeyword;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
