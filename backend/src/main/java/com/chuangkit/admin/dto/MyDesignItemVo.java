package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MyDesignItemVo {
    private Long id;
    private String title;
    private String coverUrl;
    private Integer width;
    private Integer height;
    private Integer status;
    private Long folderId;
    private Long sceneId;
    private Long templateId;
    private String sceneName;
    private String typeLabel;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
