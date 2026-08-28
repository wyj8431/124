package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.MattingTaskDto;
import com.chuangkit.admin.dto.MattingTaskRequest;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.MattingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/matting/tasks")
@RequiredArgsConstructor
public class MattingController {
    private final MattingService mattingService;

    @PostMapping
    public Result<MattingTaskDto> create(@Valid @RequestBody MattingTaskRequest request) {
        return Result.ok(mattingService.create(SecurityUtils.requireUserId(), request));
    }

    @GetMapping("/{id}")
    public Result<MattingTaskDto> get(@PathVariable Long id) {
        return Result.ok(mattingService.get(SecurityUtils.requireUserId(), id));
    }
}
