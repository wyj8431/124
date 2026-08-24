package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.entity.AiProvider;
import com.chuangkit.admin.mapper.AiProviderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/admin/ai-providers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AiProviderController {
    private final AiProviderMapper mapper;
    @GetMapping public Result<?> list() { return Result.ok(mapper.selectList(null)); }
    @PutMapping("/{id}") public Result<?> update(@PathVariable Long id, @RequestBody AiProvider provider) { provider.setId(id); provider.setApiKeyEnv(null); mapper.updateById(provider); return Result.ok(mapper.selectById(id)); }
}
