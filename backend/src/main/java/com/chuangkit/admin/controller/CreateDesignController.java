package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.PageResult;
import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.entity.DesignScene;
import com.chuangkit.admin.entity.DesignTemplate;
import com.chuangkit.admin.service.CreateDesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/create-design")
@RequiredArgsConstructor
public class CreateDesignController {

    private final CreateDesignService createDesignService;

    /** GET /admin/create-design/index — 弹窗初始化数据 */
    @GetMapping("/index")
    public Result<?> index() {
        return Result.ok(createDesignService.getIndex());
    }

    /** GET /admin/create-design/scenes — 预设尺寸卡片 */
    @GetMapping("/scenes")
    public Result<?> scenes(
            @RequestParam(defaultValue = "recommend") String navCode,
            @RequestParam(defaultValue = "common") String sizeTabCode,
            @RequestParam(required = false) String keyword) {
        return Result.ok(createDesignService.listPresetScenes(navCode, sizeTabCode, keyword));
    }

    /** GET /admin/create-design/templates — 模板推荐瀑布流 */
    @GetMapping("/templates")
    public Result<PageResult<DesignTemplate>> templates(
            @RequestParam(defaultValue = "recommend") String navCode,
            @RequestParam(defaultValue = "common") String sizeTabCode,
            @RequestParam(required = false) Long sceneId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int pageSize) {
        return Result.ok(createDesignService.listRecommendTemplates(
            navCode, sizeTabCode, sceneId, keyword, page, pageSize));
    }
}
