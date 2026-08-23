package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.service.TeamIntroService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/team-intro")
@RequiredArgsConstructor
public class TeamIntroController {

    private final TeamIntroService teamIntroService;

    /** 团队介绍页 — 对标官网 designtools/designIntroPage */
    @GetMapping("/index")
    public Result<?> index() {
        return Result.ok(teamIntroService.getPageIndex());
    }
}
