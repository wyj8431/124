package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    /** GET /admin/home/index — 首页全量数据（对应官网 designindex 页） */
    @GetMapping("/index")
    public Result<?> index() {
        return Result.ok(homeService.getHomeIndex());
    }

    @GetMapping("/search-tabs")
    public Result<?> searchTabs() {
        return Result.ok(homeService.listSearchTabs());
    }

    @GetMapping("/tabs")
    public Result<?> homeTabs() {
        return Result.ok(homeService.listHomeTabs());
    }

    @GetMapping("/hot-tags")
    public Result<?> hotTags() {
        return Result.ok(homeService.listHotTags());
    }

    @GetMapping("/features")
    public Result<?> features(@RequestParam(defaultValue = "hot") String tabCode) {
        return Result.ok(homeService.listFeatures(tabCode));
    }

    @GetMapping("/sections")
    public Result<?> sections() {
        return Result.ok(homeService.listSections());
    }

    @GetMapping("/sections/{code}")
    public Result<?> sectionDetail(@PathVariable String code) {
        return Result.ok(homeService.getSectionDetail(code));
    }

    /** 首页「最近设计」横向列表 */
    @GetMapping("/recent-designs")
    public Result<?> recentDesigns(@RequestParam(defaultValue = "12") int limit) {
        return Result.ok(homeService.listRecentDesigns(SecurityUtils.currentUserId(), limit));
    }

    /** 侧边栏「最近使用」 */
    @GetMapping("/recent-usage")
    public Result<?> recentUsage(@RequestParam(defaultValue = "8") int limit) {
        return Result.ok(homeService.listRecentUsage(SecurityUtils.currentUserId(), limit));
    }
}
