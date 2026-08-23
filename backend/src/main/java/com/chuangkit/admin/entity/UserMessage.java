package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_message")
public class UserMessage {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String category;
    private String title;
    private String summary;
    private String content;
    private String linkUrl;
    private String linkText;
    private Integer isRead;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime readTime;
}
