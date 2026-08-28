package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.DesignShareAccessDto;
import com.chuangkit.admin.dto.DesignShareCreateRequest;
import com.chuangkit.admin.dto.DesignShareLinkDto;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.DesignShareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单 */
@RestController
@RequestMapping("/admin/design-shares")
@RequiredArgsConstructor
public class DesignShareController {
    private final DesignShareService shareService;

    @PostMapping("/designs/{designId}")
    public Result<DesignShareLinkDto> create(@PathVariable Long designId, @Valid @RequestBody DesignShareCreateRequest request) {
        return Result.ok(shareService.create(designId, SecurityUtils.requireUserId(), request));
    }

    @DeleteMapping("/{token}")
    public Result<Void> revoke(@PathVariable String token) {
        shareService.revoke(token, SecurityUtils.requireUserId());
        return Result.ok();
    }

    @GetMapping("/{token}")
    public Result<DesignShareAccessDto> resolve(@PathVariable String token) {
        return Result.ok(shareService.resolve(token));
    }
}
