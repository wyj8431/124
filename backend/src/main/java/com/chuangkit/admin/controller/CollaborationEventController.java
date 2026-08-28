package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.CollaborationEventDto;
import com.chuangkit.admin.dto.CollaborationEventRequest;
import com.chuangkit.admin.entity.SysUser;
import com.chuangkit.admin.mapper.SysUserMapper;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.CollaborationEventBroker;
import com.chuangkit.admin.service.CollaborationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单 */
@RestController
@RequestMapping("/admin/collaboration/designs/{designId}/events")
@RequiredArgsConstructor
public class CollaborationEventController {
    private final CollaborationService collaborationService;
    private final CollaborationEventBroker eventBroker;
    private final SysUserMapper userMapper;

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable Long designId) {
        Long userId = SecurityUtils.requireUserId();
        Long teamId = collaborationService.requireDesignTeam(designId, userId);
        return eventBroker.subscribe(channel(teamId, designId));
    }

    @PostMapping
    public Result<Void> publish(@PathVariable Long designId, @Valid @RequestBody CollaborationEventRequest request) {
        Long userId = SecurityUtils.requireUserId();
        Long teamId = collaborationService.requireDesignTeam(designId, userId);
        SysUser user = userMapper.selectById(userId);
        CollaborationEventDto event = new CollaborationEventDto();
        event.setType(request.getType().trim());
        event.setActorId(String.valueOf(userId));
        event.setActorName(user == null ? "团队成员" : (user.getNickname() == null || user.getNickname().isBlank() ? user.getUsername() : user.getNickname()));
        event.setActorColor(request.getPayload() == null ? null : String.valueOf(request.getPayload().getOrDefault("actorColor", "")));
        event.setPayload(request.getPayload());
        event.setSentAt(System.currentTimeMillis());
        eventBroker.publish(channel(teamId, designId), event);
        return Result.ok();
    }

    private String channel(Long teamId, Long designId) {
        return teamId + ":" + designId;
    }
}
