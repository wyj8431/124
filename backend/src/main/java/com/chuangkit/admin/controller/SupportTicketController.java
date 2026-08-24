package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.SupportTicketCreateRequest;
import com.chuangkit.admin.dto.SupportTicketUpdateRequest;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/support/tickets")
@RequiredArgsConstructor
public class SupportTicketController {
    private final SupportTicketService service;
    @GetMapping public Result<?> list() { return Result.ok(service.list(SecurityUtils.requireUserId())); }
    @PostMapping public Result<?> create(@Valid @RequestBody SupportTicketCreateRequest request) { return Result.ok(service.create(SecurityUtils.requireUserId(), request)); }
    @PutMapping("/{id}") public Result<?> update(@PathVariable Long id, @Valid @RequestBody SupportTicketUpdateRequest request) { return Result.ok(service.update(SecurityUtils.requireUserId(), id, request)); }
}
