package com.chuangkit.admin.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TeamMemberRoleRequest {
    @Pattern(regexp = "admin|member", message = "成员角色只能是 admin 或 member")
    private String role;
}
