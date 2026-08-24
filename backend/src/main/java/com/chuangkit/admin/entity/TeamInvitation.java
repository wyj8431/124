package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("team_invitation")
public class TeamInvitation {
    @TableId(type = IdType.AUTO) private Long id;
    private Long teamId;
    private Long inviterId;
    private Long inviteeId;
    private String inviteeEmail;
    private String token;
    private String role;
    private String status;
    private LocalDateTime expireTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
