package com.chuangkit.admin.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TeamInviteRequest {
    private Long userId;
    private String email;

    @Pattern(regexp = "admin|member", message = "邀请角色只能是 admin 或 member")
    private String role = "member";

    @AssertTrue(message = "请提供用户 ID 或邮箱")
    public boolean hasInvitee() {
        return userId != null || (email != null && !email.isBlank());
    }
}
