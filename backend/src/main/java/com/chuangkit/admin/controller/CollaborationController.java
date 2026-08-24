package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.entity.TeamComment;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.CollaborationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/teams")
@RequiredArgsConstructor
public class CollaborationController {
    private final CollaborationService collaborationService;

    @GetMapping("/current")
    public Result<TeamOverviewDto> current() { return Result.ok(collaborationService.currentTeam(SecurityUtils.requireUserId())); }

    @GetMapping("/{teamId}")
    public Result<TeamOverviewDto> detail(@PathVariable Long teamId) { return Result.ok(collaborationService.getTeam(teamId, SecurityUtils.requireUserId())); }

    @GetMapping("/{teamId}/members")
    public Result<List<TeamMemberDto>> members(@PathVariable Long teamId) { return Result.ok(collaborationService.listMembers(teamId, SecurityUtils.requireUserId())); }

    @PostMapping("/{teamId}/invitations")
    public Result<TeamInvitationDto> invite(@PathVariable Long teamId, @Valid @RequestBody TeamInviteRequest request) { return Result.ok(collaborationService.invite(teamId, SecurityUtils.requireUserId(), request)); }

    @GetMapping("/{teamId}/invitations")
    public Result<List<TeamInvitationDto>> invitations(@PathVariable Long teamId) { return Result.ok(collaborationService.listInvitations(teamId, SecurityUtils.requireUserId())); }

    @PostMapping("/invitations/{token}/accept")
    public Result<TeamMemberDto> accept(@PathVariable String token) { return Result.ok(collaborationService.acceptInvitation(token, SecurityUtils.requireUserId())); }

    @PutMapping("/{teamId}/members/{targetUserId}/role")
    public Result<TeamMemberDto> updateRole(@PathVariable Long teamId, @PathVariable Long targetUserId, @Valid @RequestBody TeamMemberRoleRequest request) { return Result.ok(collaborationService.updateRole(teamId, targetUserId, SecurityUtils.requireUserId(), request)); }

    @DeleteMapping("/{teamId}/members/{targetUserId}")
    public Result<Void> removeMember(@PathVariable Long teamId, @PathVariable Long targetUserId) { collaborationService.removeMember(teamId, targetUserId, SecurityUtils.requireUserId()); return Result.ok(); }

    @GetMapping("/{teamId}/designs/{designId}/comments")
    public Result<List<TeamCommentDto>> comments(@PathVariable Long teamId, @PathVariable Long designId) { return Result.ok(collaborationService.listComments(teamId, designId, SecurityUtils.requireUserId())); }

    @PostMapping("/{teamId}/designs/{designId}/comments")
    public Result<TeamComment> addComment(@PathVariable Long teamId, @PathVariable Long designId, @Valid @RequestBody TeamCommentRequest request) { return Result.ok(collaborationService.addComment(teamId, designId, SecurityUtils.requireUserId(), request)); }

    @DeleteMapping("/{teamId}/comments/{commentId}")
    public Result<Void> deleteComment(@PathVariable Long teamId, @PathVariable Long commentId) { collaborationService.deleteComment(teamId, commentId, SecurityUtils.requireUserId()); return Result.ok(); }

    @GetMapping("/{teamId}/designs/{designId}/versions")
    public Result<List<TeamVersionDto>> versions(@PathVariable Long teamId, @PathVariable Long designId) { return Result.ok(collaborationService.listVersions(teamId, designId, SecurityUtils.requireUserId())); }

    @PostMapping("/{teamId}/designs/{designId}/versions")
    public Result<TeamVersionDto> createVersion(@PathVariable Long teamId, @PathVariable Long designId, @Valid @RequestBody TeamVersionRequest request) { return Result.ok(collaborationService.createVersion(teamId, designId, SecurityUtils.requireUserId(), request)); }

    @PutMapping("/{teamId}/presence")
    public Result<TeamPresenceDto> updatePresence(@PathVariable Long teamId, @Valid @RequestBody TeamPresenceRequest request) { return Result.ok(collaborationService.updatePresence(teamId, SecurityUtils.requireUserId(), request)); }

    @GetMapping("/{teamId}/presence")
    public Result<List<TeamPresenceDto>> presence(@PathVariable Long teamId) { return Result.ok(collaborationService.listPresence(teamId, SecurityUtils.requireUserId())); }
}
