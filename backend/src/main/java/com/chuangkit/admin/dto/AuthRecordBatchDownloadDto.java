package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AuthRecordBatchDownloadDto {
    private int count;
    private List<AuthRecordCertFile> files = new ArrayList<>();
}
