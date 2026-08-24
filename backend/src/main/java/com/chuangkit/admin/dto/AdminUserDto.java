package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminUserDto {
    private Long id;
    private String username;
    private String nickname;
    private String phone;
    private String systemRole;
    private Integer memberLevel;
    private Integer status;
    private LocalDateTime createTime;
}
