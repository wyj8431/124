package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
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
import com.chuangkit.admin.dto.DesignShareAccessDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DesignService {

    private final UserDesignMapper designMapper;
    private final DesignTemplateMapper templateMapper;
    private final DesignSceneMapper sceneMapper;
    private final UserRecentService userRecentService;
    private final UsageQuotaService usageQuotaService;
    private final DesignShareService designShareService;

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
        design.setRevision(1L);
        design.setStatus(1);

        boolean hasLocalTemplate = false;
        if (req.getTemplateId() != null) {
            DesignTemplate template = templateMapper.selectById(req.getTemplateId());
            if (template != null) {
                hasLocalTemplate = true;
                design.setCanvasJson(template.getCanvasJson());
                design.setWidth(template.getWidth());
                design.setHeight(template.getHeight());
                design.setCoverUrl(template.getCoverUrl());
            } else if (req.getTemplateTitle() != null && !req.getTemplateTitle().isBlank()) {
                int width = positiveOrDefault(req.getWidth(), 800);
                int height = positiveOrDefault(req.getHeight(), 600);
                design.setTitle(req.getTitle() != null ? req.getTitle() : req.getTemplateTitle());
                design.setWidth(width);
                design.setHeight(height);
                design.setCoverUrl(req.getTemplateCoverUrl());
                design.setCanvasJson(officialTemplateCanvas(width, height, req.getTemplateCoverUrl()));
            } else {
                throw new BusinessException("模板不存在");
            }
        } else if (req.getWidth() != null && req.getHeight() != null) {
            int w = req.getWidth();
            int h = req.getHeight();
            design.setWidth(w);
            design.setHeight(h);
            design.setSceneId(req.getSceneId());
            design.setCanvasJson(emptyCanvas(w, h));
        } else if (req.getSceneId() != null) {
            DesignScene scene = sceneMapper.selectById(req.getSceneId());
            if (scene == null) throw new BusinessException("场景不存在");
            design.setWidth(scene.getWidth());
            design.setHeight(scene.getHeight());
            design.setCanvasJson(emptyCanvas(scene.getWidth(), scene.getHeight()));
        } else {
            design.setWidth(800);
            design.setHeight(600);
            design.setCanvasJson(emptyCanvas(800, 600));
        }
        designMapper.insert(design);

        if (req.getTemplateId() != null && hasLocalTemplate) {
            userRecentService.record(userId, "template", req.getTemplateId());
        } else if (req.getSceneId() != null) {
            userRecentService.record(userId, "scene", req.getSceneId());
        }

        return design;
    }

    private int positiveOrDefault(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }

    private String emptyCanvas(int width, int height) {
        return "{\"version\":\"1.0\",\"width\":" + width
            + ",\"height\":" + height + ",\"layers\":[]}";
    }

    /** 官方目录只提供封面，先把封面铺满画布作为可编辑的图片图层。 */
    private String officialTemplateCanvas(int width, int height, String coverUrl) {
        if (coverUrl == null || coverUrl.isBlank()) return emptyCanvas(width, height);
        return "{\"version\":\"1.0\",\"width\":" + width
            + ",\"height\":" + height + ",\"layers\":[{"
            + "\"id\":\"official-template-cover\",\"type\":\"image\","
            + "\"x\":0,\"y\":0,\"width\":" + width + ",\"height\":" + height
            + ",\"src\":" + jsonString(coverUrl) + ",\"opacity\":1}]}";
    }

    private String jsonString(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"")
            .replace("\r", "\\r").replace("\n", "\\n") + "\"";
    }

    @Transactional
    public UserDesign save(Long id, Long userId, DesignSaveRequest req) {
        return save(id, userId, req, null);
    }

    @Transactional
    public UserDesign save(Long id, Long userId, DesignSaveRequest req, String shareToken) {
        boolean sharedEditable = false;
        UserDesign design;
        if (shareToken != null && !shareToken.isBlank()) {
            DesignShareAccessDto share = designShareService.resolve(shareToken);
            if (!id.equals(share.getDesignId()) || !"editable".equals(share.getMode())) {
                throw new BusinessException(403, "该分享链接没有编辑权限");
            }
            design = designMapper.selectById(id);
            if (design == null) throw new BusinessException("设计不存在");
            sharedEditable = true;
        } else {
            design = getById(id, userId);
        }
        long currentRevision = design.getRevision() == null ? 1L : design.getRevision();
        if (req.getRevision() != null && !req.getRevision().equals(currentRevision)) {
            throw new BusinessException(409, "设计已被其他成员修改，请重新加载后再保存");
        }
        usageQuotaService.consume(userId, "save");
        UserDesign updates = new UserDesign();
        updates.setId(id);
        updates.setRevision(currentRevision + 1);
        if (req.getTitle() != null) updates.setTitle(req.getTitle());
        if (req.getCanvasJson() != null) updates.setCanvasJson(req.getCanvasJson());
        if (req.getCoverUrl() != null) updates.setCoverUrl(req.getCoverUrl());
        if (req.getWidth() != null) updates.setWidth(req.getWidth());
        if (req.getHeight() != null) updates.setHeight(req.getHeight());
        if (req.getStatus() != null) updates.setStatus(req.getStatus());
        LambdaUpdateWrapper<UserDesign> updateWrapper = new LambdaUpdateWrapper<UserDesign>()
            .eq(UserDesign::getId, id)
            .eq(UserDesign::getRevision, currentRevision);
        if (!sharedEditable) updateWrapper.eq(UserDesign::getUserId, userId);
        int updated = designMapper.update(updates, updateWrapper);
        if (updated != 1) {
            throw new BusinessException(409, "设计已被其他成员修改，请重新加载后再保存");
        }
        return sharedEditable ? designMapper.selectById(id) : getById(id, userId);
    }

    public void delete(Long id, Long userId) {
        UserDesign design = getById(id, userId);
        designMapper.deleteById(design.getId());
    }
}
