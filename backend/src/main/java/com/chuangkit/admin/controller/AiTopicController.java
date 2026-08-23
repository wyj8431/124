package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.AiTopicGenerateRequest;
import com.chuangkit.admin.dto.AiTopicIndexDto;
import com.chuangkit.admin.service.AiTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/ai-topic")
@RequiredArgsConstructor
public class AiTopicController {

    private final AiTopicService aiTopicService;

    /** AI 专题页 — 对标官网 /designtools/aitopic/aishipin */
    @GetMapping("/{code}/index")
    public Result<AiTopicIndexDto> index(@PathVariable String code) {
        return Result.ok(aiTopicService.getIndex(code));
    }

    /** 触发 AI 视频生成 */
    @PostMapping("/{code}/generate")
    public Result<?> generate(@PathVariable String code, @RequestBody AiTopicGenerateRequest request) {
        return Result.ok(aiTopicService.generate(code, request));
    }
}
