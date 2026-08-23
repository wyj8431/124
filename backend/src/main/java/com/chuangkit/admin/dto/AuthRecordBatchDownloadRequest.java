package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AuthRecordBatchDownloadRequest {
    private List<Long> ids = new ArrayList<>();
    private boolean latestOnly = true;
}
