package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DesignShareCreateRequest {
    @NotBlank(message = "分享模式不能为空")
    private String mode;
    private Integer expireDays;
}
