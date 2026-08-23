package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class DesignSaveRequest {
    private String title;
    private Long sceneId;
    private Long templateId;
    private String canvasJson;
    private Integer width;
    private Integer height;
    private String coverUrl;
    private Integer status;
}
