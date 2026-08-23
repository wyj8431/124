package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.AiInvokeRequest;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.EditorCollectionService;
import com.chuangkit.admin.service.AiToolService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AdminResourceController {

    private final DesignSceneMapper sceneMapper;
    private final TemplateCategoryMapper categoryMapper;
    private final MaterialMapper materialMapper;
    private final EditorCollectionService editorCollectionService;
    private final AiToolService aiToolService;

    @GetMapping("/admin/scenes")
    public Result<?> scenes() {
        return Result.ok(sceneMapper.selectList(
            new LambdaQueryWrapper<DesignScene>().eq(DesignScene::getStatus, 1)
                .orderByAsc(DesignScene::getSortOrder)));
    }

    @GetMapping("/admin/categories")
    public Result<?> categories() {
        return Result.ok(categoryMapper.selectList(
            new LambdaQueryWrapper<TemplateCategory>().eq(TemplateCategory::getStatus, 1)
                .orderByAsc(TemplateCategory::getSortOrder)));
    }

    @GetMapping("/admin/materials")
    public Result<?> materials(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        LambdaQueryWrapper<Material> qw = new LambdaQueryWrapper<Material>()
            .eq(Material::getStatus, 1);
        if (type != null) qw.eq(Material::getType, type);
        if (category != null) qw.eq(Material::getCategory, category);
        return Result.ok(materialMapper.selectPage(
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, pageSize), qw));
    }

    @GetMapping("/admin/collections")
    public Result<?> collections() {
        return Result.ok(editorCollectionService.listWithPreviews());
    }

    @GetMapping("/admin/collections/{id}/templates")
    public Result<?> collectionTemplates(
            @PathVariable Long id,
            @RequestParam(defaultValue = "12") int limit) {
        return Result.ok(editorCollectionService.listTemplates(id, limit));
    }

    @GetMapping("/admin/ai-tools")
    public Result<?> aiTools(@RequestParam(required = false) String category) {
        if (category != null) {
            return Result.ok(aiToolService.listByCategory(category));
        }
        return Result.ok(aiToolService.listAll());
    }

    @PostMapping("/admin/ai-tools/{code}/invoke")
    public Result<?> invokeAi(@PathVariable String code, @RequestBody AiInvokeRequest req) {
        return Result.ok(aiToolService.invoke(
            SecurityUtils.requireUserId(), code, req.getInputParams()));
    }
}
