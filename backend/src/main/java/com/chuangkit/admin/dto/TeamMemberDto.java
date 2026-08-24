package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamMemberDto {
    private Long userId;
    private String username;
    private String nickname;
    private String avatar;
    private String role;
    private Integer status;
    private String presence;
    private LocalDateTime lastSeen;
}
