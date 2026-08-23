package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.AuthDto;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.AuthService;
import com.chuangkit.admin.service.UserAccountService;
import com.chuangkit.admin.dto.AccountPanelDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/user")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;
    private final UserAccountService userAccountService;

    @GetMapping("/profile")
    public Result<AuthDto.UserInfo> profile() {
        return Result.ok(authService.getProfile(SecurityUtils.requireUserId()));
    }

    @GetMapping("/account-panel")
    public Result<AccountPanelDto> accountPanel() {
        return Result.ok(userAccountService.getAccountPanel(SecurityUtils.requireUserId()));
    }
}
