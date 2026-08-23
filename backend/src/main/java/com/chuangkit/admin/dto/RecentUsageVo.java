package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class RecentUsageVo {
    private Long id;
    private String targetType;
    private Long targetId;
    private String name;
    private String icon;
    private String coverUrl;
}
