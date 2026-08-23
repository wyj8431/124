package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.service.TemplateCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/template-center")
@RequiredArgsConstructor
public class TemplateCenterController {

    private final TemplateCenterService templateCenterService;

    /** 模板中心页聚合配置（导航、筛选项、排序） */
    @GetMapping("/index")
    public Result<?> index() {
        return Result.ok(templateCenterService.getIndex());
    }

    /** 模板中心模板列表（支持筛选 + 热点日历事件） */
    @GetMapping("/templates")
    public Result<?> templates(
            @RequestParam(defaultValue = "design") String tab,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String scene,
            @RequestParam(required = false) String industry,
            @RequestParam(defaultValue = "hot") String sort,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String usage,
            @RequestParam(required = false) String style,
            @RequestParam(required = false) String layout,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long calendarEventId,
            @RequestParam(defaultValue = "60") int limit) {
        return Result.ok(templateCenterService.listTemplates(
            tab, category, scene, industry, sort,
            color, usage, style, layout, price, type,
            keyword, calendarEventId, limit));
    }
}
