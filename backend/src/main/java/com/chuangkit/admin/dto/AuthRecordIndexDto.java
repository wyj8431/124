package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class AuthRecordIndexDto {
    private String pageTitle;
    private String emptyText;
    private String searchPlaceholder;
    private String batchDownloadText;
    private String batchDownloadTip;
    private String defaultStartDate;
    private String defaultEndDate;
}
