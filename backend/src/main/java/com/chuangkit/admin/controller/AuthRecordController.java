package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.AuthRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/auth-record")
@RequiredArgsConstructor
public class AuthRecordController {

    private final AuthRecordService authRecordService;

    @GetMapping("/index")
    public Result<AuthRecordIndexDto> index() {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(authRecordService.getIndex(userId));
    }

    @GetMapping("/records")
    public Result<AuthRecordListDto> records(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int pageSize) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(authRecordService.listRecords(userId, keyword, startDate, endDate, page, pageSize));
    }

    @PostMapping("/records/batch-download")
    public Result<AuthRecordBatchDownloadDto> batchDownload(@RequestBody AuthRecordBatchDownloadRequest req) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(authRecordService.batchDownload(userId, req));
    }
}
