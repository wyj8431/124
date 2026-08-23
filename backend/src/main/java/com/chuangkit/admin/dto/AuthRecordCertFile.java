package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class AuthRecordCertFile {
    private Long id;
    private String authNo;
    private String fileName;
    private String contentType;
    private String content;
}
