package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class DesignCreateRequest {
    private Long sceneId;
    private Long templateId;
    /** 官网同步模板不在本地模板库时，用于创建可编辑的本地副本。 */
    private String templateTitle;
    private String templateCoverUrl;
    private String title;
    private Integer width;
    private Integer height;
    private String unit;
}
