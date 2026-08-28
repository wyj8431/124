package com.chuangkit.admin.config;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MyDesignSecurityTest {

    @Test
    void signedInUsersCanManageTheirOwnDesigns() throws IOException {
        String securityConfig = Files.readString(Path.of("src/main/java/com/chuangkit/admin/config/SecurityConfig.java"));

        assertFalse(securityConfig.contains("HttpMethod.PUT, \"/admin/my-design/**\").hasRole(\"ADMIN\")"));
        assertFalse(securityConfig.contains("HttpMethod.DELETE, \"/admin/my-design/**\").hasRole(\"ADMIN\")"));
        assertTrue(Pattern.compile(
            "\\.requestMatchers\\([\\s\\S]*?\\\"/admin/my-design/\\*\\*\\\"[\\s\\S]*?\\)\\.authenticated\\(\\)")
            .matcher(securityConfig)
            .find());
    }
}
