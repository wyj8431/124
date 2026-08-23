package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("editor_collection")
public class EditorCollection {
    @TableId(type = IdType.AUTO) private Long id;
    private String title;
    private String subtitle;
    private String coverUrl;
    private String coverUrlHover;
    private String categoryCode;
    private Integer templateCount;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
