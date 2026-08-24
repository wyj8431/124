package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamCommentDto {
    private Long id;
    private Long designId;
    private Long userId;
    private String username;
    private String nickname;
    private String content;
    private Long parentId;
    private LocalDateTime createTime;
}
