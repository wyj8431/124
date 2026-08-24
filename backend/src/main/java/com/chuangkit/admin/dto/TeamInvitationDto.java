package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamInvitationDto {
    private Long id;
    private Long teamId;
    private Long inviteeId;
    private String inviteeEmail;
    private String token;
    private String role;
    private String status;
    private LocalDateTime expireTime;
    private LocalDateTime createTime;
}
