package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class DesignCreateRequest {
    private Long sceneId;
    private Long templateId;
    private String title;
    private Integer width;
    private Integer height;
    private String unit;
}
