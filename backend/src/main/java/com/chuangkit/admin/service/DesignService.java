package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.common.PageResult;
import com.chuangkit.admin.dto.DesignCreateRequest;
import com.chuangkit.admin.dto.DesignSaveRequest;
import com.chuangkit.admin.entity.DesignScene;
import com.chuangkit.admin.entity.DesignTemplate;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.mapper.DesignSceneMapper;
import com.chuangkit.admin.mapper.DesignTemplateMapper;
import com.chuangkit.admin.mapper.UserDesignMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DesignService {

    private final UserDesignMapper designMapper;
    private final DesignTemplateMapper templateMapper;
    private final DesignSceneMapper sceneMapper;
    private final UserRecentService userRecentService;
    private final UsageQuotaService usageQuotaService;

    public PageResult<UserDesign> listByUser(Long userId, int page, int pageSize) {
        Page<UserDesign> p = designMapper.selectPage(new Page<>(page, pageSize),
            new LambdaQueryWrapper<UserDesign>()
                .eq(UserDesign::getUserId, userId)
                .orderByDesc(UserDesign::getUpdateTime));
        return PageResult.of(p);
    }

    public UserDesign getById(Long id, Long userId) {
        UserDesign design = designMapper.selectById(id);
        if (design == null) throw new BusinessException("设计不存在");
        if (!design.getUserId().equals(userId)) throw new BusinessException(403, "无权访问");
        return design;
    }

    /** 基于模板或空白场景创建设计 — 画布 JSON 存数据库，前端编辑器实时读写 */
    public UserDesign create(Long userId, DesignCreateRequest req) {
        usageQuotaService.consume(userId, "create");
        UserDesign design = new UserDesign();
        design.setUserId(userId);
        design.setTitle(req.getTitle() != null ? req.getTitle() : "未命名设计");
        design.setSceneId(req.getSceneId());
        design.setTemplateId(req.getTemplateId());
        design.setStatus(1);

        if (req.getTemplateId() != null) {
            DesignTemplate template = templateMapper.selectById(req.getTemplateId());
            if (template == null) throw new BusinessException("模板不存在");
            design.setCanvasJson(template.getCanvasJson());
            design.setWidth(template.getWidth());
            design.setHeight(template.getHeight());
            design.setCoverUrl(template.getCoverUrl());
        } else if (req.getWidth() != null && req.getHeight() != null) {
            int w = req.getWidth();
            int h = req.getHeight();
            design.setWidth(w);
            design.setHeight(h);
            design.setSceneId(req.getSceneId());
            design.setCanvasJson("{\"version\":\"1.0\",\"width\":" + w
                + ",\"height\":" + h + ",\"layers\":[]}");
        } else if (req.getSceneId() != null) {
            DesignScene scene = sceneMapper.selectById(req.getSceneId());
            if (scene == null) throw new BusinessException("场景不存在");
            design.setWidth(scene.getWidth());
            design.setHeight(scene.getHeight());
            design.setCanvasJson("{\"version\":\"1.0\",\"width\":" + scene.getWidth()
                + ",\"height\":" + scene.getHeight() + ",\"layers\":[]}");
        } else {
            design.setWidth(800);
            design.setHeight(600);
            design.setCanvasJson("{\"version\":\"1.0\",\"width\":800,\"height\":600,\"layers\":[]}");
        }
        designMapper.insert(design);

        if (req.getTemplateId() != null) {
            userRecentService.record(userId, "template", req.getTemplateId());
        } else if (req.getSceneId() != null) {
            userRecentService.record(userId, "scene", req.getSceneId());
        }

        return design;
    }

    public UserDesign save(Long id, Long userId, DesignSaveRequest req) {
        UserDesign design = getById(id, userId);
        usageQuotaService.consume(userId, "save");
        if (req.getTitle() != null) design.setTitle(req.getTitle());
        if (req.getCanvasJson() != null) design.setCanvasJson(req.getCanvasJson());
        if (req.getCoverUrl() != null) design.setCoverUrl(req.getCoverUrl());
        if (req.getWidth() != null) design.setWidth(req.getWidth());
        if (req.getHeight() != null) design.setHeight(req.getHeight());
        if (req.getStatus() != null) design.setStatus(req.getStatus());
        designMapper.updateById(design);
        return design;
    }

    public void delete(Long id, Long userId) {
        UserDesign design = getById(id, userId);
        designMapper.deleteById(design.getId());
    }
}
