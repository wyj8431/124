package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("team_presence")
public class TeamPresence {
    @TableId(type = IdType.AUTO) private Long id;
    private Long teamId;
    private Long userId;
    private String status;
    private LocalDateTime lastSeen;
    private LocalDateTime updateTime;
}
