package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.MessageCenterIndexDto;
import com.chuangkit.admin.dto.MessageCenterListDto;
import com.chuangkit.admin.dto.MessageCenterMessageVo;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.MessageCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/message-center")
@RequiredArgsConstructor
public class MessageCenterController {

    private final MessageCenterService messageCenterService;

    @GetMapping("/index")
    public Result<MessageCenterIndexDto> index() {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(messageCenterService.getIndex(userId));
    }

    @GetMapping("/messages")
    public Result<MessageCenterListDto> messages(
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(messageCenterService.listMessages(userId, category, page, pageSize));
    }

    @GetMapping("/messages/{id}")
    public Result<MessageCenterMessageVo> detail(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(messageCenterService.getMessage(userId, id));
    }

    @PostMapping("/messages/{id}/read")
    public Result<MessageCenterMessageVo> markRead(@PathVariable Long id) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(messageCenterService.markRead(userId, id));
    }

    @PostMapping("/messages/read-all")
    public Result<Integer> markAllRead(@RequestParam(defaultValue = "all") String category) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(messageCenterService.markAllRead(userId, category));
    }
}
