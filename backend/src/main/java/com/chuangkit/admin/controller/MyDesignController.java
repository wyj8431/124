package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.PageResult;
import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.MyDesignItemVo;
import com.chuangkit.admin.dto.MyDesignRequests;
import com.chuangkit.admin.dto.MyFavoriteItemVo;
import com.chuangkit.admin.entity.UserDesignFolder;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.MyDesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/my-design")
@RequiredArgsConstructor
public class MyDesignController {

    private final MyDesignService myDesignService;

    /** 我的设计页聚合配置 */
    @GetMapping("/index")
    public Result<?> index() {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.getIndex(userId));
    }

    /** 设计列表 — 对标官网 dam-page/my/list */
    @GetMapping("/designs")
    public Result<PageResult<MyDesignItemVo>> designs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "update_time") String sort,
            @RequestParam(defaultValue = "all") String typeTab,
            @RequestParam(required = false) Long folderId,
            @RequestParam(defaultValue = "grid") String viewMode) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.listDesigns(
            userId, page, pageSize, keyword, sort, typeTab, folderId, viewMode));
    }

    /** 回收站 */
    @GetMapping("/recycle")
    public Result<PageResult<MyDesignItemVo>> recycle(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int pageSize,
            @RequestParam(required = false) String keyword) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.listRecycle(userId, page, pageSize, keyword));
    }

    /** 收藏模板 */
    @GetMapping("/favorites")
    public Result<PageResult<MyFavoriteItemVo>> favorites(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "24") int pageSize,
            @RequestParam(required = false) String keyword) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.listFavorites(userId, page, pageSize, keyword));
    }

    @PutMapping("/designs/{id}/rename")
    public Result<MyDesignItemVo> rename(@PathVariable Long id, @RequestBody MyDesignRequests.Rename req) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.rename(id, userId, req.getTitle()));
    }

    @PutMapping("/designs/{id}/move")
    public Result<MyDesignItemVo> move(@PathVariable Long id, @RequestBody MyDesignRequests.Move req) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.move(id, userId, req.getFolderId()));
    }

    @DeleteMapping("/designs/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        myDesignService.deleteToRecycle(id, userId);
        return Result.ok();
    }

    @PostMapping("/designs/{id}/restore")
    public Result<MyDesignItemVo> restore(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.restore(id, userId));
    }

    @DeleteMapping("/designs/{id}/permanent")
    public Result<Void> permanentDelete(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        myDesignService.permanentDelete(id, userId);
        return Result.ok();
    }

    @PostMapping("/folders")
    public Result<UserDesignFolder> createFolder(@RequestBody MyDesignRequests.Folder req) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.createFolder(userId, req.getName()));
    }

    @PutMapping("/folders/{id}")
    public Result<UserDesignFolder> renameFolder(
            @PathVariable Long id,
            @RequestBody MyDesignRequests.Folder req) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(myDesignService.renameFolder(id, userId, req.getName()));
    }

    @DeleteMapping("/folders/{id}")
    public Result<Void> deleteFolder(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        myDesignService.deleteFolder(id, userId);
        return Result.ok();
    }

    @DeleteMapping("/favorites/{templateId}")
    public Result<Void> unlike(@PathVariable Long templateId) {
        Long userId = SecurityUtils.requireUserId();
        myDesignService.unlikeTemplate(userId, templateId);
        return Result.ok();
    }
}
