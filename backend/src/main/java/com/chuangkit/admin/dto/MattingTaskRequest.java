package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MattingTaskRequest {
    @NotBlank(message = "请先上传图片")
    @Size(max = 2048, message = "图片地址过长")
    private String sourceUrl;
}
