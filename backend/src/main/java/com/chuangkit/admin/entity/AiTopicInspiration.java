package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ai_topic_inspiration")
public class AiTopicInspiration {
    @TableId(type = IdType.AUTO) private Long id;
    private Long sectionId;
    private String title;
    private String coverUrl;
    private String coverHoverUrl;
    private String promptText;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
