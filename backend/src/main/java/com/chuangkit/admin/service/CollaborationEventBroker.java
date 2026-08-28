package com.chuangkit.admin.service;

import com.chuangkit.admin.dto.CollaborationEventDto;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

/** 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单 */
@Service
public class CollaborationEventBroker {
    static final long SSE_TIMEOUT_MS = 30 * 60 * 1000L;
    private static final long HEARTBEAT_INTERVAL_MS = 30 * 1000L;

    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> subscribers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ScheduledFuture<?>> heartbeatTasks = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatExecutor = Executors.newScheduledThreadPool(1, daemonThreadFactory());

    public SseEmitter subscribe(String channel) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        CopyOnWriteArrayList<SseEmitter> list = subscribers.computeIfAbsent(channel, ignored -> new CopyOnWriteArrayList<>());
        list.add(emitter);
        heartbeatTasks.computeIfAbsent(channel, ignored -> heartbeatExecutor.scheduleAtFixedRate(
            () -> sendHeartbeat(channel), HEARTBEAT_INTERVAL_MS, HEARTBEAT_INTERVAL_MS, TimeUnit.MILLISECONDS));
        Runnable remove = () -> remove(channel, emitter);
        emitter.onCompletion(remove);
        emitter.onTimeout(remove);
        emitter.onError(ignored -> remove.run());
        try {
            emitter.send(SseEmitter.event().name("ready").data("connected"));
        } catch (IOException exception) {
            remove.run();
        }
        return emitter;
    }

    public void publish(String channel, CollaborationEventDto event) {
        List<SseEmitter> list = subscribers.get(channel);
        if (list == null) return;
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name("collaboration").data(event));
            } catch (IOException exception) {
                remove(channel, emitter);
            }
        }
    }

    private void remove(String channel, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = subscribers.get(channel);
        if (list == null) return;
        list.remove(emitter);
        if (!list.isEmpty()) return;
        subscribers.remove(channel, list);
        ScheduledFuture<?> heartbeat = heartbeatTasks.remove(channel);
        if (heartbeat != null) heartbeat.cancel(false);
    }

    public void shutdown() {
        heartbeatExecutor.shutdownNow();
        subscribers.clear();
        heartbeatTasks.values().forEach(task -> task.cancel(false));
        heartbeatTasks.clear();
    }

    private void sendHeartbeat(String channel) {
        List<SseEmitter> list = subscribers.get(channel);
        if (list == null) return;
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().comment("heartbeat"));
            } catch (IOException exception) {
                remove(channel, emitter);
            }
        }
    }

    private static ThreadFactory daemonThreadFactory() {
        return runnable -> {
            Thread thread = new Thread(runnable, "collaboration-sse-heartbeat");
            thread.setDaemon(true);
            return thread;
        };
    }
}
