package com.chuangkit.admin.controller;



import com.chuangkit.admin.common.PageResult;

import com.chuangkit.admin.common.Result;

import com.chuangkit.admin.dto.RecommendTemplateVo;

import com.chuangkit.admin.entity.DesignTemplate;

import com.chuangkit.admin.security.SecurityUtils;

import com.chuangkit.admin.service.TemplateService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;



import java.util.List;

import java.util.Map;



@RestController

@RequestMapping("/admin/templates")

@RequiredArgsConstructor

public class TemplateController {



    private final TemplateService templateService;



    @GetMapping

    public Result<PageResult<DesignTemplate>> list(

            @RequestParam(defaultValue = "1") int page,

            @RequestParam(defaultValue = "20") int pageSize,

            @RequestParam(required = false) Long categoryId,

            @RequestParam(required = false) Long sceneId) {

        return Result.ok(templateService.list(page, pageSize, categoryId, sceneId));

    }



    /** 首页「为您推荐」模板列表（含点赞状态） */

    @GetMapping("/recommend")

    public Result<List<RecommendTemplateVo>> recommend(

            @RequestParam(defaultValue = "12") int limit) {

        return Result.ok(templateService.listRecommend(SecurityUtils.currentUserId(), limit));

    }



    @GetMapping("/search")

    public Result<PageResult<DesignTemplate>> search(

            @RequestParam(required = false) String keyword,

            @RequestParam(defaultValue = "1") int page,

            @RequestParam(defaultValue = "20") int pageSize) {

        return Result.ok(templateService.search(keyword, page, pageSize));

    }



    @GetMapping("/{id}")

    public Result<DesignTemplate> detail(@PathVariable Long id) {

        return Result.ok(templateService.getById(id));

    }



    @PostMapping("/{id}/use")

    public Result<Void> use(@PathVariable Long id) {

        templateService.incrementUseCount(id);

        templateService.recordView(SecurityUtils.currentUserId(), id);

        return Result.ok();

    }



    @PostMapping("/{id}/view")

    public Result<Void> view(@PathVariable Long id) {

        templateService.recordView(SecurityUtils.currentUserId(), id);

        return Result.ok();

    }



    @PostMapping("/{id}/like")

    public Result<Map<String, Object>> like(@PathVariable Long id) {

        return Result.ok(templateService.toggleLike(SecurityUtils.requireUserId(), id));

    }



    /** 参考模板生图 */

    @PostMapping("/{id}/reference-generate")

    public Result<Map<String, Object>> referenceGenerate(@PathVariable Long id) {

        return Result.ok(templateService.referenceGenerate(SecurityUtils.currentUserId(), id));

    }

}

