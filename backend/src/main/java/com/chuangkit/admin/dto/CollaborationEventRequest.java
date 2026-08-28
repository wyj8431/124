package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.Map;

@Data
public class CollaborationEventRequest {
    @NotBlank(message = "协作事件类型不能为空")
    @Pattern(regexp = "cursor|document-update|layer-lock|layer-unlock|presence", message = "协作事件类型不受支持")
    private String type;
    private Map<String, Object> payload;
}
