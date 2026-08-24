package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.entity.AiTask;
import com.chuangkit.admin.entity.AiTool;
import com.chuangkit.admin.mapper.AiTaskMapper;
import com.chuangkit.admin.mapper.AiToolMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiToolService {

    private final AiToolMapper aiToolMapper;
    private final AiTaskMapper aiTaskMapper;

    public List<AiTool> listAll() {
        return aiToolMapper.selectList(
            new LambdaQueryWrapper<AiTool>().eq(AiTool::getStatus, 1)
                .orderByAsc(AiTool::getSortOrder));
    }

    public List<AiTool> listByCategory(String category) {
        return aiToolMapper.selectList(
            new LambdaQueryWrapper<AiTool>()
                .eq(AiTool::getCategory, category)
                .eq(AiTool::getStatus, 1)
                .orderByAsc(AiTool::getSortOrder));
    }

    public AiTool getByCode(String code) {
        AiTool tool = aiToolMapper.selectOne(
            new LambdaQueryWrapper<AiTool>().eq(AiTool::getCode, code));
        if (tool == null) throw new BusinessException("AI工具不存在");
        return tool;
    }

    /**
     * 调用 AI 工具 — 创建任务记录，返回任务 ID。
     * 真实环境对接 AI 服务（抠图/生图/生视频），此处模拟异步完成。
     */
    public Map<String, Object> invoke(Long userId, String toolCode, String inputParams) {
        AiTool tool = getByCode(toolCode);
        AiTask task = new AiTask();
        task.setUserId(userId);
        task.setToolId(tool.getId());
        task.setInputParams(inputParams);
        task.setStatus(1);
        String svg = "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#eef2ff'/><text x='50%' y='50%' text-anchor='middle' font-family='Arial' font-size='28' fill='#4338ca'>灵图工坊 AI 任务队列</text></svg>";
        task.setOutputUrl("data:image/svg+xml;charset=UTF-8," + URLEncoder.encode(svg, StandardCharsets.UTF_8));
        task.setFinishTime(LocalDateTime.now());
        aiTaskMapper.insert(task);
        return Map.of(
            "taskId", task.getId(),
            "status", task.getStatus(),
            "outputUrl", task.getOutputUrl(),
            "toolName", tool.getName()
        );
    }
}
