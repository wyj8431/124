package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class EditorCollectionVo {
    private Long id;
    private String title;
    private String subtitle;
    private String coverUrl;
    private String coverUrlHover;
    private String categoryCode;
    private Integer templateCount;
    /** 卡片预览图（最多 2 张，用于叠放展示） */
    private List<String> previewUrls;
}
