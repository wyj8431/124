package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ai_topic_section")
public class AiTopicSection {
    @TableId(type = IdType.AUTO) private Long id;
    private String pageCode;
    private String title;
    private String emoji;
    private String moreText;
    private String moreLink;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
