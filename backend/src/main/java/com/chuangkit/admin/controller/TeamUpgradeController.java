package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.TeamUpgradeModalDto;
import com.chuangkit.admin.dto.TeamUpgradeSubmitRequest;
import com.chuangkit.admin.dto.TeamUpgradeSubmitResult;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.TeamUpgradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/team-upgrade")
@RequiredArgsConstructor
public class TeamUpgradeController {

    private final TeamUpgradeService teamUpgradeService;

    /** 团队升级弹窗配置 — 对标官网「升级为团队或企业」 */
    @GetMapping("/modal")
    public Result<TeamUpgradeModalDto> modal() {
        return Result.ok(teamUpgradeService.getModal(SecurityUtils.currentUserId()));
    }

    /** 提交免费升级团队/企业 */
    @PostMapping("/submit")
    public Result<TeamUpgradeSubmitResult> submit(@Valid @RequestBody TeamUpgradeSubmitRequest request) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(teamUpgradeService.submit(userId, request));
    }
}
