package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.AdminUserDto;
import com.chuangkit.admin.dto.AdminUserUpdateRequest;
import com.chuangkit.admin.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public Result<List<AdminUserDto>> list() {
        return Result.ok(adminUserService.listUsers());
    }

    @PutMapping("/{id}")
    public Result<AdminUserDto> update(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return Result.ok(adminUserService.updateUser(id, request));
    }
}
