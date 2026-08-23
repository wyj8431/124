package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class HomeSectionCardVo {
    private Long id;
    private String label;
    private Long templateId;
    private String title;
    private String coverUrl;
    private Integer width;
    private Integer height;
    private Integer isFree;
}
