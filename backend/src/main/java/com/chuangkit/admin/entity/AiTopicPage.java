package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ai_topic_page")
public class AiTopicPage {
    @TableId(type = IdType.AUTO) private Long id;
    private String code;
    private String title;
    private String breadcrumbParent;
    private String breadcrumbParentUrl;
    private String promptPlaceholder;
    private String generateButtonText;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
