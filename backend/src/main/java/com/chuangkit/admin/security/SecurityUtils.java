package com.chuangkit.admin.security;

import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Long currentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long userId) {
            return userId;
        }
        return null;
    }

    public static Long requireUserId() {
        Long userId = currentUserId();
        if (userId == null) {
            throw new com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException(401, "请先登录");
        }
        return userId;
    }
}
