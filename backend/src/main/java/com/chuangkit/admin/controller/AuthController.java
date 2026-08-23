package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.AuthDto;
import com.chuangkit.admin.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        return Result.ok(authService.login(req));
    }

    @PostMapping("/register")
    public Result<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        return Result.ok(authService.register(req));
    }

    @PostMapping("/sms/send")
    public Result<AuthDto.SmsSendResponse> sendSms(@Valid @RequestBody AuthDto.SmsSendRequest req) {
        return Result.ok(authService.sendSmsWithMeta(req.getPhone()));
    }

    @PostMapping("/register/phone")
    public Result<AuthDto.AuthResponse> registerByPhone(@Valid @RequestBody AuthDto.PhoneRegisterRequest req) {
        return Result.ok(authService.registerByPhone(req));
    }

    @PostMapping("/sms/send-reset")
    public Result<AuthDto.SmsSendResponse> sendResetSms(@Valid @RequestBody AuthDto.SmsSendRequest req) {
        return Result.ok(authService.sendResetSmsWithMeta(req.getPhone()));
    }

    @PostMapping("/password/reset")
    public Result<AuthDto.AuthResponse> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest req) {
        return Result.ok(authService.resetPassword(req));
    }
}
