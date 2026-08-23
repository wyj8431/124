package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.config.SmsProperties;
import com.chuangkit.admin.dto.AuthDto;
import com.chuangkit.admin.entity.SysUser;
import com.chuangkit.admin.mapper.SysUserMapper;
import com.chuangkit.admin.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SmsService smsService;
    private final SmsProperties smsProperties;

    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        SysUser user = findUserByLoginId(req.getUsername());
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());
        return new AuthDto.AuthResponse(token, AuthDto.UserInfo.from(user));
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest req) {
        Long count = userMapper.selectCount(
            new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, req.getUsername()));
        if (count > 0) {
            throw new BusinessException("用户已经注册过");
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            Long phoneCount = userMapper.selectCount(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getPhone, req.getPhone()));
            if (phoneCount > 0) {
                throw new BusinessException("用户已经注册过");
            }
        }
        SysUser user = new SysUser();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setNickname(req.getNickname() != null ? req.getNickname() : req.getUsername());
        user.setPhone(req.getPhone());
        user.setMemberLevel(0);
        user.setStatus(1);
        userMapper.insert(user);
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());
        return new AuthDto.AuthResponse(token, AuthDto.UserInfo.from(user));
    }

    public AuthDto.UserInfo getProfile(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) throw new BusinessException("用户不存在");
        return AuthDto.UserInfo.from(user);
    }

    public AuthDto.SmsSendResponse sendSmsWithMeta(String phone) {
        Long count = userMapper.selectCount(
            new LambdaQueryWrapper<SysUser>().eq(SysUser::getPhone, phone));
        if (count > 0) {
            throw new BusinessException("用户已经注册过，请直接登录");
        }
        return doSendSms(phone);
    }

    /** 忘记密码 — 仅向已注册手机号发送验证码 */
    public AuthDto.SmsSendResponse sendResetSmsWithMeta(String phone) {
        SysUser user = userMapper.selectOne(
            new LambdaQueryWrapper<SysUser>().eq(SysUser::getPhone, phone));
        if (user == null) {
            throw new BusinessException("该手机号尚未注册");
        }
        return doSendSms(phone);
    }

    /** 通过手机验证码重置密码 */
    public AuthDto.AuthResponse resetPassword(AuthDto.ResetPasswordRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new BusinessException("两次密码输入不一致");
        }
        if (req.getPassword().length() < 6 || req.getPassword().length() > 18) {
            throw new BusinessException("密码长度需为6-18位");
        }
        smsService.verify(req.getPhone(), req.getSmsCode());

        SysUser user = userMapper.selectOne(
            new LambdaQueryWrapper<SysUser>().eq(SysUser::getPhone, req.getPhone()));
        if (user == null) {
            throw new BusinessException("该手机号尚未注册");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }

        user.setPassword(passwordEncoder.encode(req.getPassword()));
        userMapper.updateById(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());
        return new AuthDto.AuthResponse(token, AuthDto.UserInfo.from(user));
    }

    private AuthDto.SmsSendResponse doSendSms(String phone) {
        SmsService.SendResult result = smsService.sendCode(phone);
        var resp = new AuthDto.SmsSendResponse();
        resp.setMessage(result.realSms() ? "验证码已发送至您的手机" : "验证码已发送");
        resp.setRealSms(result.realSms());
        if (!result.realSms() && smsProperties.isExposeDebugCode()) {
            resp.setDebugCode(result.debugCode());
        }
        return resp;
    }

    public AuthDto.AuthResponse registerByPhone(AuthDto.PhoneRegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new BusinessException("两次密码输入不一致");
        }
        if (req.getPassword().length() < 6 || req.getPassword().length() > 18) {
            throw new BusinessException("密码长度需为6-18位");
        }
        smsService.verify(req.getPhone(), req.getSmsCode());

        Long count = userMapper.selectCount(
            new LambdaQueryWrapper<SysUser>().eq(SysUser::getPhone, req.getPhone()));
        if (count > 0) {
            throw new BusinessException("用户已经注册过");
        }

        SysUser user = new SysUser();
        user.setUsername("u_" + req.getPhone());
        user.setPhone(req.getPhone());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setNickname("用户" + req.getPhone().substring(7));
        user.setMemberLevel(0);
        user.setStatus(1);
        userMapper.insert(user);
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());
        return new AuthDto.AuthResponse(token, AuthDto.UserInfo.from(user));
    }

    private SysUser findUserByLoginId(String loginId) {
        String id = loginId == null ? "" : loginId.trim();
        if (id.isEmpty()) {
            return null;
        }
        if (id.matches("^1[3-9]\\d{9}$")) {
            SysUser byPhone = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getPhone, id));
            if (byPhone != null) {
                return byPhone;
            }
        }
        return userMapper.selectOne(
            new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, id));
    }
}
