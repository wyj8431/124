package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.AiGenerateRequest;
import com.chuangkit.admin.entity.AiTask;
import com.chuangkit.admin.entity.AiTool;
import com.chuangkit.admin.mapper.AiTaskMapper;
import com.chuangkit.admin.mapper.AiToolMapper;
import com.chuangkit.admin.mapper.AiProviderMapper;
import com.chuangkit.admin.entity.AiProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AiGenerateService {

    private static final long MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024L;

    private final AiTaskMapper aiTaskMapper;
    private final AiToolMapper aiToolMapper;
    private final AiProviderMapper aiProviderMapper;

    @Value("${chuangkit.upload.base-url:http://localhost:8081/uploads}")
    private String uploadBaseUrl;

    @Value("${chuangkit.ai.endpoint:}")
    private String configuredEndpoint;

    @Value("${chuangkit.ai.api-key:}")
    private String configuredApiKey;

    @Value("${chuangkit.ai.model:}")
    private String configuredModel;

    public Map<String, Object> getConfig(String mode) {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("mode", mode);

        switch (mode) {
            case "agent" -> {
                config.put("models", List.of());
                config.put("aspectRatios", List.of());
                config.put("styles", List.of());
                config.put("promptTags", List.of(
                    tag("提示词库", "帮我写一段电商海报的提示词"),
                    tag("商品素材Agent", "为这款商品生成白底素材图"),
                    tag("服装模特Agent", "为这件服装生成模特穿搭效果图"),
                    tag("海报Agent", "设计一张促销海报，突出折扣信息"),
                    tag("视频Agent", "生成15秒产品展示短视频脚本")
                ));
            }
            case "image_gen" -> {
                config.put("models", List.of(
                    option("omni_image_2", "全能图像 2.0"),
                    option("creative_image", "创意图像 1.5"),
                    option("product_image", "商品图像 Pro")
                ));
                config.put("aspectRatios", List.of(
                    option("1:1", "1:1"),
                    option("3:4", "3:4"),
                    option("4:3", "4:3"),
                    option("9:16", "9:16"),
                    option("16:9", "16:9")
                ));
                config.put("styles", List.of(
                    option("general", "通用风格"),
                    option("realistic", "写实摄影"),
                    option("illustration", "插画风格"),
                    option("3d", "3D 渲染")
                ));
                config.put("promptTags", List.of(
                    tag("商品模特", "商品放在模特手中，商业摄影风格"),
                    tag("商品配景", "商品置于简约北欧风场景中"),
                    tag("电商主图", "白底商品主图，高清细节"),
                    tag("海报背景", "渐变科技感海报背景")
                ));
            }
            case "video_gen" -> {
                config.put("models", List.of(
                    option("happy_horse", "HappyHorse"),
                    option("video_pro", "视频 Pro 1.0"),
                    option("short_video", "短剧快剪")
                ));
                config.put("aspectRatios", List.of(
                    option("1:1", "1:1"),
                    option("9:16", "9:16"),
                    option("16:9", "16:9")
                ));
                config.put("styles", List.of());
                config.put("promptTags", List.of(
                    tag("视频生成Agent", "生成一段产品展示短视频，节奏轻快")
                ));
            }
            default -> throw new BusinessException("不支持的生成模式: " + mode);
        }
        return config;
    }

    public Map<String, Object> generate(Long userId, AiGenerateRequest req) {
        if (req.getPrompt() == null || req.getPrompt().isBlank()) {
            throw new BusinessException("请输入描述内容");
        }
        String mode = req.getMode() != null ? req.getMode() : "agent";
        AiTool tool = resolveTool(req, mode);
        AiTask task = new AiTask();
        task.setUserId(userId != null ? userId : 1L);
        task.setToolId(tool.getId());
        task.setInputParams(buildInputJson(req));
        task.setStatus(0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mode", mode);
        result.put("toolName", tool.getName());
        result.put("message", buildMessage(mode, req.getPrompt()));

        result.put("outputType", outputType(mode));
        if ("video_gen".equals(mode)) result.put("duration", "00:15");
        if ("agent".equals(mode)) result.put("steps", buildAgentSteps(req));

        aiTaskMapper.insert(task);
        result.put("taskId", task.getId());
        result.put("status", task.getStatus());
        processAsync(task, req);
        return result;
    }

    private void processAsync(AiTask task, AiGenerateRequest req) {
        Thread.startVirtualThread(() -> {
            try {
                ProviderConfig provider = resolveProvider();
                if (provider == null) {
                    throw new IllegalStateException("AI 服务尚未配置，请设置 AI_PROVIDER_ENDPOINT 和 AI_PROVIDER_API_KEY 后重试");
                }
                task.setOutputUrl(invokeProvider(provider, req));
                task.setStatus(1);
                task.setFinishTime(LocalDateTime.now());
                task.setErrorMsg(null);
            } catch (Exception ex) {
                task.setStatus(2);
                task.setErrorMsg(ex.getMessage() == null ? "AI Provider 调用失败" : truncate(ex.getMessage(), 500));
                task.setFinishTime(LocalDateTime.now());
            }
            aiTaskMapper.updateById(task);
        });
    }

    private ProviderConfig resolveProvider() {
        if (!configuredEndpoint.isBlank()) {
            return new ProviderConfig(configuredEndpoint, configuredApiKey, configuredModel);
        }
        AiProvider provider = aiProviderMapper.selectOne(new LambdaQueryWrapper<AiProvider>()
            .eq(AiProvider::getEnabled, 1).orderByAsc(AiProvider::getId).last("LIMIT 1"));
        if (provider == null || provider.getEndpoint() == null || provider.getEndpoint().isBlank()) return null;
        String key = provider.getApiKeyEnv() == null ? "" : System.getenv(provider.getApiKeyEnv());
        return new ProviderConfig(provider.getEndpoint(), key, provider.getModel());
    }

    private String invokeProvider(ProviderConfig provider, AiGenerateRequest req) throws Exception {
        String body = "{\"model\":\"" + json(firstNonBlank(req.getModel(), provider.model())) + "\",\"prompt\":\"" + json(req.getPrompt()) + "\",\"mode\":\"" + json(req.getMode()) + "\",\"aspectRatio\":\"" + json(req.getAspectRatio()) + "\",\"style\":\"" + json(req.getStyle()) + "\"}";
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(provider.endpoint())).header("Content-Type", "application/json");
        if (provider.apiKey() != null && !provider.apiKey().isBlank()) builder.header("Authorization", "Bearer " + provider.apiKey());
        HttpResponse<String> response = HttpClient.newHttpClient().send(builder.POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) throw new IOException("Provider HTTP " + response.statusCode());
        return extractOutputUrl(response.body());
    }

    static String extractOutputUrl(String body) {
        List<String> expressions = List.of(
            "\\\"outputUrl\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"",
            "\\\"url\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"",
            "\\\"b64_json\\\"\\s*:\\s*\\\"([^\\\"]+)\\\""
        );
        for (String expression : expressions) {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(expression).matcher(body);
            if (matcher.find()) {
                String value = matcher.group(1);
                return expression.contains("b64_json") ? "data:image/png;base64," + value : value;
            }
        }
        throw new IllegalArgumentException("Provider 响应缺少可用的输出地址");
    }

    private String json(String value) { return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\""); }

    public Map<String, Object> upload(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择要上传的文件");
        }
        String ext = validateImageUpload(file.getOriginalFilename(), file.getContentType(), file.getSize());
        try (var input = file.getInputStream()) {
            if (ImageIO.read(input) == null) {
                throw new BusinessException("文件内容不是有效图片");
            }
        }
        String filename = "ref-" + System.currentTimeMillis() + ext;
        Path dir = Path.of(System.getProperty("user.dir"), "uploads");
        Files.createDirectories(dir);
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        String url = uploadBaseUrl.replaceAll("/$", "") + "/" + filename;
        return Map.of("url", url, "filename", filename);
    }

    static String validateImageUpload(String originalFilename, String contentType, long size) {
        if (size <= 0 || size > MAX_IMAGE_UPLOAD_BYTES) {
            throw new BusinessException("图片大小不能超过 5MB");
        }
        String extension = Optional.ofNullable(originalFilename)
            .filter(name -> name.contains("."))
            .map(name -> name.substring(name.lastIndexOf('.')).toLowerCase(Locale.ROOT))
            .orElse("");
        if (!List.of(".jpg", ".jpeg", ".png", ".gif").contains(extension)) {
            throw new BusinessException("仅支持 JPG、PNG、GIF 图片");
        }
        if (!List.of("image/jpeg", "image/jpg", "image/png", "image/gif").contains(contentType)) {
            throw new BusinessException("图片类型不受支持");
        }
        return extension;
    }

    public Map<String, String> enhancePrompt(String prompt, String mode) {
        if (prompt == null || prompt.isBlank()) {
            throw new BusinessException("请先输入描述内容");
        }
        String text = prompt.trim();
        String suffix = switch (mode) {
            case "image_gen" -> "，高清细节，构图精美，适合电商主图与海报场景";
            case "video_gen" -> "，镜头流畅自然，光影层次丰富，适合短视频传播";
            default -> "，画面清晰有质感，风格统一，适合商业创意输出";
        };
        if (text.endsWith("。") || text.endsWith("！") || text.endsWith("？") || text.endsWith("…")) {
            text = text.substring(0, text.length() - 1);
        }
        return Map.of("prompt", text + suffix);
    }

    private AiTool resolveTool(AiGenerateRequest req, String mode) {
        if (req.getToolCode() != null && !req.getToolCode().isBlank()) {
            AiTool tool = aiToolMapper.selectOne(
                new LambdaQueryWrapper<AiTool>().eq(AiTool::getCode, req.getToolCode()));
            if (tool != null) return tool;
        }
        String code = switch (mode) {
            case "image_gen" -> "ai_draw";
            case "video_gen" -> "ai_video";
            default -> "ai_poster";
        };
        AiTool tool = aiToolMapper.selectOne(
            new LambdaQueryWrapper<AiTool>().eq(AiTool::getCode, code));
        if (tool == null) {
            throw new BusinessException("AI 工具未配置");
        }
        return tool;
    }

    private String buildInputJson(AiGenerateRequest req) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("mode", req.getMode());
        m.put("prompt", req.getPrompt());
        m.put("model", req.getModel());
        m.put("aspectRatio", req.getAspectRatio());
        m.put("style", req.getStyle());
        m.put("referenceUrls", req.getReferenceUrls());
        m.put("agentMode", req.getAgentMode());
        m.put("autoMode", req.getAutoMode());
        m.put("toolCode", req.getToolCode());
        return m.toString();
    }

    private List<Map<String, String>> buildAgentSteps(AiGenerateRequest req) {
        boolean auto = Boolean.TRUE.equals(req.getAutoMode());
        List<Map<String, String>> steps = new ArrayList<>();
        steps.add(step("analyze", "分析需求", "已理解：" + truncate(req.getPrompt(), 40)));
        if (req.getReferenceUrls() != null && !req.getReferenceUrls().isEmpty()) {
            steps.add(step("reference", "参考图解析", "已加载 " + req.getReferenceUrls().size() + " 张参考图"));
        }
        steps.add(step("plan", auto ? "自动规划" : "Agent 规划", auto ? "自动选择最佳创作路径" : "按 Agent 模式分步执行"));
        steps.add(step("generate", "生成作品", "已完成渲染输出"));
        return steps;
    }

    private Map<String, String> step(String code, String title, String detail) {
        return Map.of("code", code, "title", title, "detail", detail);
    }

    private String buildMessage(String mode, String prompt) {
        return switch (mode) {
            case "image_gen" -> "图片已生成：" + truncate(prompt, 24);
            case "video_gen" -> "视频已生成：" + truncate(prompt, 24);
            default -> "Agent 已完成创作：" + truncate(prompt, 24);
        };
    }

    private int[] parseAspectSize(String ratio) {
        if (ratio == null) return new int[]{800, 800};
        return switch (ratio) {
            case "3:4" -> new int[]{600, 800};
            case "4:3" -> new int[]{800, 600};
            case "9:16" -> new int[]{720, 1280};
            case "16:9" -> new int[]{1280, 720};
            default -> new int[]{800, 800};
        };
    }

    private Map<String, String> tag(String name, String keyword) {
        return Map.of("name", name, "keyword", keyword);
    }

    private Map<String, String> option(String code, String name) {
        return Map.of("code", code, "name", name);
    }

    private String outputType(String mode) {
        return switch (mode) {
            case "image_gen" -> "image";
            case "video_gen" -> "video";
            default -> "agent";
        };
    }

    private String firstNonBlank(String first, String second) {
        return first != null && !first.isBlank() ? first : (second == null ? "" : second);
    }

    private record ProviderConfig(String endpoint, String apiKey, String model) {}

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }
}
