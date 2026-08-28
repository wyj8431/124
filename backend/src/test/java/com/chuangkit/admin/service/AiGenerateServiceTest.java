package com.chuangkit.admin.service;

import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AiGenerateServiceTest {

    @Test
    void extractsUrlFromOpenAiImageResponse() {
        String body = "{\"data\":[{\"url\":\"https://cdn.example.com/image.png\"}]}";

        assertEquals("https://cdn.example.com/image.png", AiGenerateService.extractOutputUrl(body));
    }

    @Test
    void extractsUrlFromProviderResponse() {
        String body = "{\"outputUrl\":\"https://cdn.example.com/result.mp4\"}";

        assertEquals("https://cdn.example.com/result.mp4", AiGenerateService.extractOutputUrl(body));
    }

    @Test
    void rejectsProviderResponseWithoutOutputUrl() {
        assertThrows(IllegalArgumentException.class, () -> AiGenerateService.extractOutputUrl("{\"status\":\"queued\"}"));
    }

    @Test
    void acceptsOnlySupportedImageUploadMetadataWithinFiveMegabytes() {
        assertEquals(".png", AiGenerateService.validateImageUpload("portrait.PNG", "image/png", 1024));
        assertEquals(".jpg", AiGenerateService.validateImageUpload("portrait.jpg", "image/jpeg", 1024));
        assertEquals(".gif", AiGenerateService.validateImageUpload("portrait.gif", "image/gif", 1024));
    }

    @Test
    void rejectsOversizedOrUnsupportedImageUploadMetadata() {
        assertThrows(BusinessException.class,
            () -> AiGenerateService.validateImageUpload("portrait.png", "image/png", 5 * 1024 * 1024L + 1));
        assertThrows(BusinessException.class,
            () -> AiGenerateService.validateImageUpload("portrait.webp", "image/webp", 1024));
        assertThrows(BusinessException.class,
            () -> AiGenerateService.validateImageUpload("portrait.png", "image/png", 0));
    }
}
