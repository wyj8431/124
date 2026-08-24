package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.UsageConsumeRequest;
import com.chuangkit.admin.dto.UsageQuotaDto;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.UsageQuotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/usage")
@RequiredArgsConstructor
public class UsageQuotaController {
    private final UsageQuotaService usageQuotaService;

    @GetMapping("/quota")
    public Result<UsageQuotaDto> quota() {
        return Result.ok(usageQuotaService.getStatus(SecurityUtils.requireUserId()));
    }

    @PostMapping("/consume")
    public Result<UsageQuotaDto> consume(@Valid @RequestBody UsageConsumeRequest request) {
        Long userId = SecurityUtils.requireUserId();
        usageQuotaService.consume(userId, request.getAction());
        return Result.ok(usageQuotaService.getStatus(userId));
    }
}
