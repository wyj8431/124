package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ai_topic_preset")
public class AiTopicPreset {
    @TableId(type = IdType.AUTO) private Long id;
    private String pageCode;
    private String title;
    private String coverUrl;
    private String promptText;
    private Integer cardRotateDeg;
    private Integer cardOffsetX;
    private Integer cardZIndex;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
