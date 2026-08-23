package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    /** 意见反馈表单页 — 对标官网问卷星 */
    @GetMapping("/index")
    public Result<FeedbackIndexDto> index() {
        return Result.ok(feedbackService.getIndex());
    }

    /** 提交意见反馈 */
    @PostMapping("/submit")
    public Result<FeedbackSubmitResult> submit(@Valid @RequestBody FeedbackSubmitRequest request) {
        return Result.ok(feedbackService.submit(request));
    }

    /** 提交成功页 — 对标官网提交后福利引导 */
    @GetMapping("/success/{id}")
    public Result<FeedbackSuccessDto> success(@PathVariable Long id) {
        return Result.ok(feedbackService.getSuccess(id));
    }
}
