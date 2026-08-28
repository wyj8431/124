package com.chuangkit.admin.service;

import com.chuangkit.admin.dto.CollaborationEventDto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CollaborationEventBrokerTest {
    private final CollaborationEventBroker broker = new CollaborationEventBroker();

    @AfterEach
    void tearDown() {
        broker.shutdown();
    }

    @Test
    void subscribeUsesFiniteTimeoutAndTracksHeartbeatLifecycle() throws Exception {
        SseEmitter emitter = broker.subscribe("team:design");

        assertNotNull(emitter);
        assertEquals(30 * 60 * 1000L, staticLong("SSE_TIMEOUT_MS"));
        assertEquals(1, map("subscribers").size());
        assertEquals(1, map("heartbeatTasks").size());

        remove("team:design", emitter);

        assertEquals(0, map("subscribers").size());
        assertEquals(0, map("heartbeatTasks").size());
    }

    @Test
    void failedBusinessEventRemovesTheSubscriberAndHeartbeat() throws Exception {
        SseEmitter emitter = broker.subscribe("team:design");
        remove("team:design", emitter);
        broker.publish("team:design", new CollaborationEventDto());

        assertEquals(0, map("subscribers").size());
        assertEquals(0, map("heartbeatTasks").size());
    }

    private long staticLong(String fieldName) throws Exception {
        Field field = CollaborationEventBroker.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.getLong(null);
    }

    private Map<?, ?> map(String fieldName) throws Exception {
        Field field = CollaborationEventBroker.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        return (Map<?, ?>) field.get(broker);
    }

    private void remove(String channel, SseEmitter emitter) throws Exception {
        Method method = CollaborationEventBroker.class.getDeclaredMethod("remove", String.class, SseEmitter.class);
        method.setAccessible(true);
        method.invoke(broker, channel, emitter);
    }
}
