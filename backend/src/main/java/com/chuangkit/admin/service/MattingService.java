package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.MattingTaskDto;
import com.chuangkit.admin.dto.MattingTaskRequest;
import com.chuangkit.admin.entity.AiProvider;
import com.chuangkit.admin.entity.AiTask;
import com.chuangkit.admin.entity.AiTool;
import com.chuangkit.admin.mapper.AiProviderMapper;
import com.chuangkit.admin.mapper.AiTaskMapper;
import com.chuangkit.admin.mapper.AiToolMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MattingService {

    private static final List<String> OUTPUT_EXPRESSIONS = List.of(
        "\\\"outputUrl\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"",
        "\\\"url\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"",
        "\\\"b64_json\\\"\\s*:\\s*\\\"([^\\\"]+)\\\""
    );

    private final AiTaskMapper aiTaskMapper;
    private final AiToolMapper aiToolMapper;
    private final AiProviderMapper aiProviderMapper;
    private final ObjectMapper objectMapper;
    private final MockMattingProvider mockMattingProvider;

    @Value("${chuangkit.ai.endpoint:}")
    private String configuredEndpoint;

    @Value("${chuangkit.ai.api-key:}")
    private String configuredApiKey;

    @Value("${chuangkit.ai.model:}")
    private String configuredModel;

    @Value("${chuangkit.ai.mock.enabled:true}")
    private boolean mockEnabled;

    public MattingTaskDto create(Long userId, MattingTaskRequest request) {
        if (userId == null) {
            throw new BusinessException(401, "请先登录");
        }
        AiTool tool = aiToolMapper.selectOne(new LambdaQueryWrapper<AiTool>()
            .eq(AiTool::getCode, "matting")
            .eq(AiTool::getStatus, 1)
            .eq(AiTool::getDeleted, 0));
        if (tool == null) {
            throw new BusinessException("抠图工具未配置");
        }

        AiTask task = new AiTask();
        task.setUserId(userId);
        task.setToolId(tool.getId());
        task.setInputParams(toInputJson(request.getSourceUrl()));
        task.setStatus(0);
        aiTaskMapper.insert(task);
        processAsync(task, request.getSourceUrl());
        return toDto(task);
    }

    public MattingTaskDto get(Long userId, Long taskId) {
        if (userId == null) {
            throw new BusinessException(401, "请先登录");
        }
        AiTask task = aiTaskMapper.selectOne(new LambdaQueryWrapper<AiTask>()
            .eq(AiTask::getId, taskId)
            .eq(AiTask::getUserId, userId));
        if (task == null) {
            throw new BusinessException(404, "抠图任务不存在");
        }
        return toDto(task);
    }

    private void processAsync(AiTask task, String sourceUrl) {
        Thread.startVirtualThread(() -> {
            try {
                MattingProvider provider = resolveMattingProvider();
                if (provider == null) {
                    throw new IllegalStateException("AI 抠图服务尚未配置，请设置 AI_PROVIDER_ENDPOINT 和 AI_PROVIDER_API_KEY 后重试");
                }
                task.setOutputUrl(provider.process(sourceUrl));
                task.setStatus(1);
                task.setErrorMsg(null);
            } catch (Exception ex) {
                task.setStatus(2);
                task.setErrorMsg(truncate(Optional.ofNullable(ex.getMessage()).orElse("AI 抠图服务调用失败"), 500));
            } finally {
                task.setFinishTime(LocalDateTime.now());
                aiTaskMapper.updateById(task);
            }
        });
    }

    private MattingProvider resolveMattingProvider() {
        ProviderConfig provider = resolveProvider();
        if (provider != null) {
            return sourceUrl -> invokeProvider(provider, sourceUrl);
        }
        return shouldUseMock(configuredEndpoint, mockEnabled, provider != null) ? mockMattingProvider : null;
    }

    static boolean shouldUseMock(String endpoint, boolean mockEnabled, boolean databaseProviderAvailable) {
        return (endpoint == null || endpoint.isBlank()) && !databaseProviderAvailable && mockEnabled;
    }

    private ProviderConfig resolveProvider() {
        if (configuredEndpoint != null && !configuredEndpoint.isBlank()) {
            return new ProviderConfig(configuredEndpoint, configuredApiKey, configuredModel);
        }
        AiProvider provider = aiProviderMapper.selectOne(new LambdaQueryWrapper<AiProvider>()
            .eq(AiProvider::getEnabled, 1)
            .orderByAsc(AiProvider::getId)
            .last("LIMIT 1"));
        if (provider == null || provider.getEndpoint() == null || provider.getEndpoint().isBlank()) {
            return null;
        }
        String key = provider.getApiKeyEnv() == null ? "" : System.getenv(provider.getApiKeyEnv());
        return new ProviderConfig(provider.getEndpoint(), key, provider.getModel());
    }

    private String invokeProvider(ProviderConfig provider, String sourceUrl) throws IOException, InterruptedException {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("model", provider.model());
        payload.put("mode", "matting");
        payload.put("imageUrl", sourceUrl);
        String body;
        try {
            body = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IOException("无法构造抠图请求", ex);
        }

        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(provider.endpoint()))
            .header("Content-Type", "application/json");
        if (provider.apiKey() != null && !provider.apiKey().isBlank()) {
            builder.header("Authorization", "Bearer " + provider.apiKey());
        }
        HttpResponse<String> response = HttpClient.newHttpClient().send(
            builder.POST(HttpRequest.BodyPublishers.ofString(body)).build(),
            HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) {
            throw new IOException("Provider HTTP " + response.statusCode());
        }
        return extractOutputUrl(response.body());
    }

    static String extractOutputUrl(String body) {
        for (String expression : OUTPUT_EXPRESSIONS) {
            Matcher matcher = Pattern.compile(expression).matcher(body);
            if (matcher.find()) {
                String value = matcher.group(1);
                return expression.contains("b64_json") ? "data:image/png;base64," + value : value;
            }
        }
        throw new IllegalArgumentException("Provider 响应缺少可用的透明图输出地址");
    }

    private String toInputJson(String sourceUrl) {
        try {
            return objectMapper.writeValueAsString(Map.of("mode", "matting", "sourceUrl", sourceUrl));
        } catch (JsonProcessingException ex) {
            throw new BusinessException("无法保存抠图任务参数");
        }
    }

    private MattingTaskDto toDto(AiTask task) {
        MattingTaskDto dto = new MattingTaskDto();
        dto.setId(task.getId());
        dto.setStatus(task.getStatus());
        dto.setOutputUrl(task.getOutputUrl());
        dto.setErrorMsg(task.getErrorMsg());
        dto.setMock(task.getOutputUrl() != null && task.getOutputUrl().contains("/matting-mock-"));
        dto.setCreateTime(task.getCreateTime());
        dto.setFinishTime(task.getFinishTime());
        dto.setSourceUrl(readSourceUrl(task.getInputParams()));
        return dto;
    }

    private String readSourceUrl(String inputParams) {
        if (inputParams == null || inputParams.isBlank()) return null;
        try {
            return objectMapper.readTree(inputParams).path("sourceUrl").asText(null);
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    private String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    private record ProviderConfig(String endpoint, String apiKey, String model) {}
}
