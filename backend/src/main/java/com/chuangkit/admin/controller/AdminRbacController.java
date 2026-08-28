package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.AdminUserDto;
import com.chuangkit.admin.dto.AdminUserUpdateRequest;
import com.chuangkit.admin.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/admin/rbac")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRbacController {
    private final AdminUserService userService;

    @GetMapping
    public Result<Map<String, Object>> catalog() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("roles", List.of(
            Map.of("code", "admin", "label", "管理员", "description", "访问全部页面、AI 工具与管理能力"),
            Map.of("code", "user", "label", "普通用户", "description", "浏览首页、模板、个人空间并使用创作工具"),
            Map.of("code", "operator", "label", "运营人员", "description", "运营内容与客服工单")
        ));
        result.put("permissions", List.of(
            Map.of("code", "page:home", "label", "首页浏览"),
            Map.of("code", "page:templates", "label", "模板中心"),
            Map.of("code", "workspace:read", "label", "个人空间"),
            Map.of("code", "design:create", "label", "创建设计"),
            Map.of("code", "design:edit", "label", "编辑与保存"),
            Map.of("code", "ai:matting", "label", "AI 抠图"),
            Map.of("code", "rbac:manage", "label", "角色与权限管理"),
            Map.of("code", "support:manage", "label", "工单管理")
        ));
        result.put("rolePermissions", Map.of(
            "admin", List.of("page:home", "page:templates", "workspace:read", "design:create", "design:edit", "ai:matting", "rbac:manage", "support:manage"),
            "user", List.of("page:home", "page:templates", "workspace:read", "design:create", "design:edit", "support:create"),
            "operator", List.of("page:home", "page:templates", "workspace:read", "support:manage")
        ));
        result.put("users", userService.listUsers());
        return Result.ok(result);
    }

    @PutMapping("/users/{id}")
    public Result<AdminUserDto> updateUser(@PathVariable Long id, @RequestBody AdminUserUpdateRequest request) {
        return Result.ok(userService.updateUser(id, request));
    }
}
