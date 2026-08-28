package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DesignShareLinkDto {
    private Long id;
    private Long designId;
    private String token;
    private String mode;
    private LocalDateTime expireTime;
    private Boolean revoked;
}
