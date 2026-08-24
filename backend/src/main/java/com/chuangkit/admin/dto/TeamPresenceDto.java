package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamPresenceDto {
    private Long userId;
    private String username;
    private String nickname;
    private String status;
    private LocalDateTime lastSeen;
}
