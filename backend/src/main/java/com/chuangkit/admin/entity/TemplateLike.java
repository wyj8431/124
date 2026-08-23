package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("template_like")
public class TemplateLike {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private Long templateId;
    private LocalDateTime createTime;
}
