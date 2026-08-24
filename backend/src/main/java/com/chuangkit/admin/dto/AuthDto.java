package com.chuangkit.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank private String username;
        @NotBlank private String password;
        private String nickname;
        private String phone;
    }

    @Data
    public static class PhoneRegisterRequest {
        @NotBlank private String phone;
        @NotBlank private String smsCode;
        @NotBlank private String password;
        @NotBlank private String confirmPassword;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank private String phone;
        @NotBlank private String smsCode;
        @NotBlank private String password;
        @NotBlank private String confirmPassword;
    }

    @Data
    public static class SmsSendRequest {
        @NotBlank private String phone;
    }

    @Data
    public static class SmsSendResponse {
        private String message;
        private boolean realSms;
        private String debugCode;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private UserInfo user;

        public AuthResponse(String token, UserInfo user) {
            this.token = token;
            this.user = user;
        }
    }

    @Data
    public static class UserInfo {
        private Long id;
        private String username;
        private String nickname;
        private String avatar;
        private Integer memberLevel;
        private String memberLevelName;
        private String systemRole;

        public static UserInfo from(com.chuangkit.admin.entity.SysUser u) {
            UserInfo info = new UserInfo();
            info.id = u.getId();
            info.username = u.getUsername();
            info.nickname = u.getNickname();
            info.avatar = u.getAvatar();
            info.memberLevel = u.getMemberLevel();
            info.systemRole = u.getSystemRole() == null ? "user" : u.getSystemRole();
            info.memberLevelName = switch (u.getMemberLevel() != null ? u.getMemberLevel() : 0) {
                case 1 -> "VIP会员";
                case 2 -> "团队版";
                default -> "免费用户";
            };
            return info;
        }
    }
}
