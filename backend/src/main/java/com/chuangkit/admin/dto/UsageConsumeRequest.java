package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsageConsumeRequest {
    @NotBlank(message = "额度类型不能为空")
    private String action;
}
