package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamVersionDto {
    private Long id;
    private Long designId;
    private Integer versionNo;
    private Long userId;
    private String username;
    private String nickname;
    private String canvasJson;
    private String note;
    private LocalDateTime createTime;
}
