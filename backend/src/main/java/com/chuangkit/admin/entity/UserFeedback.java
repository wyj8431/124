package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_feedback")
public class UserFeedback {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String feedbackTypeCode;
    private String feedbackContent;
    private String contactInfo;
    private LocalDateTime createTime;
}
