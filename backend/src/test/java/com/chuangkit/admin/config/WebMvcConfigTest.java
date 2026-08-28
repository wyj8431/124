package com.chuangkit.admin.config;

import org.junit.jupiter.api.Test;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class WebMvcConfigTest {

    @Test
    void resourceLocationAlwaysEndsWithSlashForStaticUploads() {
        assertTrue(WebMvcConfig.toResourceLocation(Path.of("uploads")).endsWith("/"));
    }
}
