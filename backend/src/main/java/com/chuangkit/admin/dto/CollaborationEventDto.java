package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.Map;

@Data
public class CollaborationEventDto {
    private String type;
    private String actorId;
    private String actorName;
    private String actorColor;
    private Map<String, Object> payload;
    private long sentAt;
}
