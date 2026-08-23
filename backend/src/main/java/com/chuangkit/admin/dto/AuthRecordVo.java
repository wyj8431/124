package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class AuthRecordVo {
    private Long id;
    private Long designId;
    private String authNo;
    private String designTitle;
    private String coverUrl;
    private String authType;
    private String authTypeLabel;
    private String licenseHolder;
    private String licenseNo;
    private String sizeLabel;
    private String authTime;
    private Integer certVersion;
    private boolean latestCert;
}
