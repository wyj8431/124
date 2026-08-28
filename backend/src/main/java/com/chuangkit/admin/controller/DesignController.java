package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.PageResult;
import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.DesignCreateRequest;
import com.chuangkit.admin.dto.DesignSaveRequest;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.DesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/designs")
@RequiredArgsConstructor
public class DesignController {

    private final DesignService designService;

    /** 最近设计列表 — 对应官网左侧「最近设计」 */
    @GetMapping
    public Result<PageResult<UserDesign>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(designService.listByUser(userId, page, pageSize));
    }

    @GetMapping("/{id}")
    public Result<UserDesign> detail(@PathVariable Long id) {
        return Result.ok(designService.getById(id, SecurityUtils.requireUserId()));
    }

    /** 创建设计 — 基于模板或空白场景，返回 canvasJson 供编辑器加载 */
    @PostMapping
    public Result<UserDesign> create(@RequestBody DesignCreateRequest req) {
        return Result.ok(designService.create(SecurityUtils.requireUserId(), req));
    }

    /** 保存设计 — 编辑器 autosave 调用，canvasJson 持久化到数据库 */
    @PutMapping("/{id}")
    public Result<UserDesign> save(@PathVariable Long id, @RequestParam(required = false) String shareToken, @RequestBody DesignSaveRequest req) {
        return Result.ok(designService.save(id, SecurityUtils.requireUserId(), req, shareToken));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        designService.delete(id, SecurityUtils.requireUserId());
        return Result.ok();
    }
}
