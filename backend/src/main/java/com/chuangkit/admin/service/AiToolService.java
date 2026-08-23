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
        task.setOutputUrl("https://picsum.photos/seed/ai-" + System.currentTimeMillis() + "/800/600");
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
