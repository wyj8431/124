package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeamUpgradeSubmitRequest {
    @NotBlank
    private String sizeCode;
}
