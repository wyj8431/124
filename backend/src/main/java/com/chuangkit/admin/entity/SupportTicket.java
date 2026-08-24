package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("support_ticket")
public class SupportTicket {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String subject;
    private String content;
    private String priority;
    private String status;
    private Long assigneeId;
    private String lastReply;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
