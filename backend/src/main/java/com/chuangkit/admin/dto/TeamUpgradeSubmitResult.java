package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class TeamUpgradeSubmitResult {
    private String teamName;
    private String redirectPath;
    private String message;
}
