package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ai_tool")
public class AiTool {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private String description;
    private String icon;
    private String coverUrl;
    private String category;
    private String apiEndpoint;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
