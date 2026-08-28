package com.chuangkit.admin.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MattingServiceTest {

    @Test
    void extractsTransparentImageUrlFromProviderResponse() {
        String body = "{\"outputUrl\":\"https://cdn.example.com/cutout.png\"}";

        assertEquals("https://cdn.example.com/cutout.png", MattingService.extractOutputUrl(body));
    }

    @Test
    void extractsBase64ImageFromOpenAiStyleResponse() {
        String body = "{\"data\":[{\"b64_json\":\"abc123\"}]}";

        assertEquals("data:image/png;base64,abc123", MattingService.extractOutputUrl(body));
    }

    @Test
    void rejectsProviderResponseWithoutOutput() {
        assertThrows(IllegalArgumentException.class, () -> MattingService.extractOutputUrl("{\"status\":\"queued\"}"));
    }

    @Test
    void usesMockOnlyWhenRealProviderIsUnavailableAndMockIsEnabled() {
        assertEquals(true, MattingService.shouldUseMock("", true, false));
        assertEquals(false, MattingService.shouldUseMock("https://provider.example.com/matting", true, false));
        assertEquals(false, MattingService.shouldUseMock("", false, false));
        assertEquals(false, MattingService.shouldUseMock("", true, true));
    }
}
