package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class AiTopicInspirationDto {
    private Long id;
    private String title;
    private String coverUrl;
    private String coverHoverUrl;
    private String promptText;
}
