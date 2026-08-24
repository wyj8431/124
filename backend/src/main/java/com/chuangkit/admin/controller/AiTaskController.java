package com.chuangkit.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.entity.AiTask;
import com.chuangkit.admin.mapper.AiTaskMapper;
import com.chuangkit.admin.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/ai-tasks")
@RequiredArgsConstructor
public class AiTaskController {
    private final AiTaskMapper mapper;
    @GetMapping("/{id}")
    public Result<AiTask> get(@PathVariable Long id) {
        AiTask task = mapper.selectOne(new LambdaQueryWrapper<AiTask>().eq(AiTask::getId, id).eq(AiTask::getUserId, SecurityUtils.requireUserId()));
        return task == null ? Result.fail(404, "AI 任务不存在") : Result.ok(task);
    }
}
