package com.chuangkit.admin.config;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class MultipartUploadConfigTest {

    @Test
    void multipartLimitsMatchTheFiveMegabyteImageUploadContract() throws IOException {
        String applicationConfig = Files.readString(Path.of("src/main/resources/application.yml"));

        assertTrue(applicationConfig.contains("max-file-size: 5MB"));
        assertTrue(applicationConfig.contains("max-request-size: 6MB"));
    }
}
