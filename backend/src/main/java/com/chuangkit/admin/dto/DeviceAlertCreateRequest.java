package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeviceAlertCreateRequest {
    @NotBlank private String deviceId;
    @NotBlank private String alertType;
    private String severity = "warning";
    @NotBlank private String message;
}
