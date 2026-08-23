package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class AiTopicPresetDto {
    private Long id;
    private String title;
    private String coverUrl;
    private String promptText;
    private Integer cardRotateDeg;
    private Integer cardOffsetX;
    private Integer cardZIndex;
}
