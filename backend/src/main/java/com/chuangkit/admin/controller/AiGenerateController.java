package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.AiGenerateRequest;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.AiGenerateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/admin/ai")
@RequiredArgsConstructor
public class AiGenerateController {

    private final AiGenerateService aiGenerateService;

    /** 获取各模式下的模型、比例、风格、快捷标签 */
    @GetMapping("/config")
    public Result<?> config(@RequestParam String mode) {
        return Result.ok(aiGenerateService.getConfig(mode));
    }

    /** AI 生成：Agent / 图片 / 视频 */
    @PostMapping("/generate")
    public Result<?> generate(@RequestBody AiGenerateRequest req) {
        return Result.ok(aiGenerateService.generate(SecurityUtils.requireUserId(), req));
    }

    /** 上传参考图 */
    @PostMapping("/upload")
    public Result<?> upload(@RequestParam("file") MultipartFile file) throws Exception {
        SecurityUtils.requireUserId();
        return Result.ok(aiGenerateService.upload(file));
    }

    /** 魔法棒：润色提示词 */
    @PostMapping("/enhance-prompt")
    public Result<?> enhancePrompt(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        String mode = body.getOrDefault("mode", "video_gen");
        return Result.ok(aiGenerateService.enhancePrompt(prompt, mode));
    }
}
