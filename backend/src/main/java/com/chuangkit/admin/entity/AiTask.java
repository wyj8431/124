package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ai_task")
public class AiTask {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private Long toolId;
    private String inputParams;
    private String outputUrl;
    private Integer status;
    private String errorMsg;
    private LocalDateTime createTime;
    private LocalDateTime finishTime;
}
