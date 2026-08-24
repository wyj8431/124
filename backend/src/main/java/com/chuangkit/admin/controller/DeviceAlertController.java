package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.DeviceAlertCreateRequest;
import com.chuangkit.admin.dto.DeviceAlertStatusRequest;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.DeviceAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/device-alerts")
@RequiredArgsConstructor
public class DeviceAlertController {
    private final DeviceAlertService service;
    @GetMapping public Result<?> list() { return Result.ok(service.list(SecurityUtils.requireUserId())); }
    @PostMapping public Result<?> create(@Valid @RequestBody DeviceAlertCreateRequest request) { return Result.ok(service.create(SecurityUtils.requireUserId(), request)); }
    @PutMapping("/{id}") public Result<?> update(@PathVariable Long id, @Valid @RequestBody DeviceAlertStatusRequest request) { return Result.ok(service.update(SecurityUtils.requireUserId(), id, request)); }
}
