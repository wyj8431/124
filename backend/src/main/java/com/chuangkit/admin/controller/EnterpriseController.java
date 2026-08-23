package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.EnterpriseAccountOverviewDto;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.EnterpriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/enterprise")
@RequiredArgsConstructor
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    /** 企业账户概览 — 对标官网 designtools/enterprise/accountOverview */
    @GetMapping("/account-overview")
    public Result<EnterpriseAccountOverviewDto> accountOverview() {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(enterpriseService.getAccountOverview(userId));
    }
}
