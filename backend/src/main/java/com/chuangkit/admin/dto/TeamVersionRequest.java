package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TeamVersionRequest {
    @NotBlank(message = "画布数据不能为空")
    private String canvasJson;
    @Size(max = 256, message = "版本备注不能超过 256 字")
    private String note;
}
