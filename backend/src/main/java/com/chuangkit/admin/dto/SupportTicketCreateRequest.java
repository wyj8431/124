package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupportTicketCreateRequest {
    @NotBlank private String subject;
    @NotBlank private String content;
    private String priority = "normal";
}
