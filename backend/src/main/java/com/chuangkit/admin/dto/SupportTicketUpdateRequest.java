package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupportTicketUpdateRequest {
    @NotBlank private String status;
    private String reply;
}
