package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class UsageQuotaDto {
    private String usageDate;
    private boolean unlimited;
    private int limit;
    private int createUsed;
    private int saveUsed;
    private int exportUsed;
    private int createRemaining;
    private int saveRemaining;
    private int exportRemaining;
}
