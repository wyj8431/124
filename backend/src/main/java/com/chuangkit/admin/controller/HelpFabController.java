package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.HelpFabIndexDto;
import com.chuangkit.admin.service.HelpFabService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/help-fab")
@RequiredArgsConstructor
public class HelpFabController {

    private final HelpFabService helpFabService;

    /** 右下角帮助悬浮菜单 — 对标官网 help fab */
    @GetMapping("/index")
    public Result<HelpFabIndexDto> index() {
        return Result.ok(helpFabService.getIndex());
    }
}
