package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    @NotBlank(message = "角色不能为空")
    private String systemRole;
    private Integer status;
}
