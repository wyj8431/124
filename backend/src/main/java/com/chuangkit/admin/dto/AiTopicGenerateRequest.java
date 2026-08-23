package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class AiTopicGenerateRequest {
    private String prompt;
    private Long presetId;
    private Long inspirationId;
}
