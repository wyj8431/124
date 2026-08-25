package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.*;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import com.chuangkit.admin.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CollaborationService {
    private final TeamMapper teamMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final TeamInvitationMapper invitationMapper;
    private final TeamCommentMapper commentMapper;
    private final TeamDesignVersionMapper versionMapper;
    private final TeamPresenceMapper presenceMapper;
    private final SysUserMapper userMapper;
    private final UserDesignMapper designMapper;
    private final UserMessageMapper messageMapper;

    public TeamOverviewDto currentTeam(Long userId) {
        TeamMember membership = membershipForUser(userId);
        Team team = membership == null ? createDefaultTeam(userId) : teamMapper.selectById(membership.getTeamId());
        if (team == null) throw new BusinessException("团队不存在");
        return toOverview(team, userId);
    }

    public TeamOverviewDto getTeam(Long teamId, Long userId) {
        Team team = requireMember(teamId, userId).team();
        return toOverview(team, userId);
    }

    public List<TeamMemberDto> listMembers(Long teamId, Long userId) {
        requireMember(teamId, userId);
        List<TeamMember> members = teamMemberMapper.selectList(new LambdaQueryWrapper<TeamMember>()
            .eq(TeamMember::getTeamId, teamId).eq(TeamMember::getStatus, 1)
            .orderByAsc(TeamMember::getRole).orderByAsc(TeamMember::getCreateTime));
        return members.stream().map(this::toMember).toList();
    }

    @Transactional
    public TeamInvitationDto invite(Long teamId, Long userId, TeamInviteRequest request) {
        TeamMember membership = requireMember(teamId, userId).member();
        requireManager(membership);
        Team team = teamMapper.selectById(teamId);
        int count = teamMemberMapper.selectCount(new LambdaQueryWrapper<TeamMember>()
            .eq(TeamMember::getTeamId, teamId).eq(TeamMember::getStatus, 1)).intValue();
        if (team.getMaxMembers() != null && count >= team.getMaxMembers()) {
            throw new BusinessException("团队成员数量已达上限");
        }
        Long inviteeId = request.getUserId();
        String email = StringUtils.hasText(request.getEmail()) ? request.getEmail().trim() : null;
        if (inviteeId == null && email != null) {
            SysUser invitee = userMapper.selectOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getEmail, email));
            if (invitee != null) inviteeId = invitee.getId();
        }
        if (inviteeId != null) {
            SysUser invitee = userMapper.selectById(inviteeId);
            if (invitee == null) throw new BusinessException("被邀请用户不存在");
            TeamMember existing = teamMemberMapper.selectOne(new LambdaQueryWrapper<TeamMember>()
                .eq(TeamMember::getTeamId, teamId).eq(TeamMember::getUserId, inviteeId).last("LIMIT 1"));
            if (existing != null && existing.getStatus() == 1) throw new BusinessException("用户已经是团队成员");
            if (email == null) email = invitee.getEmail();
        }
        TeamInvitation invitation = new TeamInvitation();
        invitation.setTeamId(teamId);
        invitation.setInviterId(userId);
        invitation.setInviteeId(inviteeId);
        invitation.setInviteeEmail(email);
        invitation.setToken(UUID.randomUUID().toString().replace("-", ""));
        invitation.setRole(request.getRole() == null ? "member" : request.getRole());
        invitation.setStatus("pending");
        invitation.setExpireTime(LocalDateTime.now().plusDays(7));
        invitationMapper.insert(invitation);
        return toInvitation(invitation);
    }

    public List<TeamInvitationDto> listInvitations(Long teamId, Long userId) {
        requireMember(teamId, userId);
        return invitationMapper.selectList(new LambdaQueryWrapper<TeamInvitation>()
            .eq(TeamInvitation::getTeamId, teamId).orderByDesc(TeamInvitation::getCreateTime))
            .stream().map(this::toInvitation).toList();
    }

    @Transactional
    public TeamMemberDto acceptInvitation(String token, Long userId) {
        TeamInvitation invitation = invitationMapper.selectOne(new LambdaQueryWrapper<TeamInvitation>()
            .eq(TeamInvitation::getToken, token).last("LIMIT 1"));
        if (invitation == null) throw new BusinessException("邀请不存在");
        if (!"pending".equals(invitation.getStatus())) throw new BusinessException("邀请已处理");
        if (invitation.getExpireTime() != null && invitation.getExpireTime().isBefore(LocalDateTime.now())) {
            invitation.setStatus("expired"); invitationMapper.updateById(invitation);
            throw new BusinessException("邀请已过期");
        }
        SysUser user = userMapper.selectById(userId);
        if (invitation.getInviteeId() != null && !invitation.getInviteeId().equals(userId)) {
            throw new BusinessException(403, "该邀请不属于当前用户");
        }
        if (invitation.getInviteeId() == null && StringUtils.hasText(invitation.getInviteeEmail())
            && (user == null || !invitation.getInviteeEmail().equalsIgnoreCase(user.getEmail()))) {
            throw new BusinessException(403, "请使用受邀邮箱登录后接受邀请");
        }
        Team team = teamMapper.selectById(invitation.getTeamId());
        if (team == null) throw new BusinessException("团队不存在");
        TeamMember existing = teamMemberMapper.selectOne(new LambdaQueryWrapper<TeamMember>()
            .eq(TeamMember::getTeamId, team.getId()).eq(TeamMember::getUserId, userId).last("LIMIT 1"));
        if (existing == null) {
            existing = new TeamMember();
            existing.setTeamId(team.getId()); existing.setUserId(userId);
            existing.setRole(invitation.getRole()); existing.setStatus(1);
            teamMemberMapper.insert(existing);
        } else {
            existing.setRole(invitation.getRole()); existing.setStatus(1); teamMemberMapper.updateById(existing);
        }
        int count = teamMemberMapper.selectCount(new LambdaQueryWrapper<TeamMember>()
            .eq(TeamMember::getTeamId, team.getId()).eq(TeamMember::getStatus, 1)).intValue();
        team.setMemberCount(count); teamMapper.updateById(team);
        invitation.setStatus("accepted"); invitation.setInviteeId(userId); invitationMapper.updateById(invitation);
        return toMember(existing);
    }

    @Transactional
    public TeamMemberDto updateRole(Long teamId, Long targetUserId, Long userId, TeamMemberRoleRequest request) {
        TeamMember actor = requireMember(teamId, userId).member();
        if (!"owner".equals(actor.getRole())) throw new BusinessException(403, "只有团队 owner 可以调整角色");
        TeamMember target = teamMemberMapper.selectOne(new LambdaQueryWrapper<TeamMember>()
            .eq(TeamMember::getTeamId, teamId).eq(TeamMember::getUserId, targetUserId)
            .eq(TeamMember::getStatus, 1).last("LIMIT 1"));
        if (target == null) throw new BusinessException("成员不存在");
        if ("owner".equals(target.getRole())) throw new BusinessException("不能调整 owner 角色");
        target.setRole(request.getRole()); teamMemberMapper.updateById(target);
        return toMember(target);
    }

    @Transactional
    public void removeMember(Long teamId, Long targetUserId, Long userId) {
        TeamMember actor = requireMember(teamId, userId).member();
        if (!"owner".equals(actor.getRole())) throw new BusinessException(403, "只有团队 owner 可以移除成员");
        if (targetUserId.equals(userId)) throw new BusinessException("owner 不能移除自己");
        TeamMember target = teamMemberMapper.selectOne(new LambdaQueryWrapper<TeamMember>()
            .eq(TeamMember::getTeamId, teamId).eq(TeamMember::getUserId, targetUserId)
            .eq(TeamMember::getStatus, 1).last("LIMIT 1"));
        if (target == null) throw new BusinessException("成员不存在");
        target.setStatus(0); teamMemberMapper.updateById(target);
        Team team = teamMapper.selectById(teamId);
        if (team != null) { team.setMemberCount(teamMemberMapper.selectCount(new LambdaQueryWrapper<TeamMember>()
            .eq(TeamMember::getTeamId, teamId).eq(TeamMember::getStatus, 1)).intValue()); teamMapper.updateById(team); }
    }

    public List<TeamCommentDto> listComments(Long teamId, Long designId, Long userId) {
        verifyDesignAccess(teamId, designId, userId);
        return commentMapper.selectList(new LambdaQueryWrapper<TeamComment>()
            .eq(TeamComment::getTeamId, teamId).eq(TeamComment::getDesignId, designId)
            .eq(TeamComment::getStatus, 1).orderByAsc(TeamComment::getCreateTime))
            .stream().map(this::toComment).toList();
    }

    @Transactional
    public TeamComment addComment(Long teamId, Long designId, Long userId, TeamCommentRequest request) {
        verifyDesignAccess(teamId, designId, userId);
        UserDesign design = designMapper.selectById(designId);
        TeamComment comment = new TeamComment(); comment.setTeamId(teamId); comment.setDesignId(designId);
        comment.setUserId(userId); comment.setContent(request.getContent().trim());
        comment.setParentId(request.getParentId() == null ? 0L : request.getParentId()); comment.setStatus(1);
        commentMapper.insert(comment);
        notifyTeamMembers(teamId, userId, designId, design, "团队评论更新",
            "有成员在这个设计中发布了新评论", "评论内容：" + comment.getContent());
        return comment;
    }

    @Transactional
    public void deleteComment(Long teamId, Long commentId, Long userId) {
        TeamMember actor = requireMember(teamId, userId).member();
        TeamComment comment = commentMapper.selectById(commentId);
        if (comment == null || !teamId.equals(comment.getTeamId())) throw new BusinessException("评论不存在");
        if (!userId.equals(comment.getUserId()) && !"owner".equals(actor.getRole()) && !"admin".equals(actor.getRole())) {
            throw new BusinessException(403, "无权删除该评论");
        }
        commentMapper.deleteById(commentId);
    }

    public List<TeamVersionDto> listVersions(Long teamId, Long designId, Long userId) {
        verifyDesignAccess(teamId, designId, userId);
        return versionMapper.selectList(new LambdaQueryWrapper<TeamDesignVersion>()
            .eq(TeamDesignVersion::getTeamId, teamId).eq(TeamDesignVersion::getDesignId, designId)
            .orderByDesc(TeamDesignVersion::getVersionNo)).stream().map(this::toVersion).toList();
    }

    @Transactional
    public TeamVersionDto createVersion(Long teamId, Long designId, Long userId, TeamVersionRequest request) {
        verifyDesignAccess(teamId, designId, userId);
        UserDesign design = designMapper.selectById(designId);
        Integer latest = versionMapper.selectList(new LambdaQueryWrapper<TeamDesignVersion>()
            .eq(TeamDesignVersion::getDesignId, designId).orderByDesc(TeamDesignVersion::getVersionNo).last("LIMIT 1"))
            .stream().findFirst().map(TeamDesignVersion::getVersionNo).orElse(0);
        TeamDesignVersion version = new TeamDesignVersion(); version.setTeamId(teamId); version.setDesignId(designId);
        version.setVersionNo(latest + 1); version.setUserId(userId); version.setCanvasJson(request.getCanvasJson()); version.setNote(request.getNote());
        versionMapper.insert(version);
        notifyTeamMembers(teamId, userId, designId, design, "新版本快照已创建",
            "团队成员创建了新的设计版本快照", request.getNote());
        return toVersion(version);
    }

    @Transactional
    public TeamPresenceDto updatePresence(Long teamId, Long userId, TeamPresenceRequest request) {
        requireMember(teamId, userId);
        TeamPresence presence = presenceMapper.selectOne(new LambdaQueryWrapper<TeamPresence>()
            .eq(TeamPresence::getTeamId, teamId).eq(TeamPresence::getUserId, userId).last("LIMIT 1"));
        if (presence == null) { presence = new TeamPresence(); presence.setTeamId(teamId); presence.setUserId(userId); }
        presence.setStatus(request.getStatus()); presence.setLastSeen(LocalDateTime.now()); presence.setUpdateTime(LocalDateTime.now());
        if (presence.getId() == null) presenceMapper.insert(presence); else presenceMapper.updateById(presence);
        return toPresence(presence);
    }

    public List<TeamPresenceDto> listPresence(Long teamId, Long userId) {
        requireMember(teamId, userId);
        return presenceMapper.selectList(new LambdaQueryWrapper<TeamPresence>().eq(TeamPresence::getTeamId, teamId)
            .orderByDesc(TeamPresence::getLastSeen)).stream().map(this::toPresence).toList();
    }

    private void verifyDesignAccess(Long teamId, Long designId, Long userId) {
        requireMember(teamId, userId);
        UserDesign design = designMapper.selectById(designId);
        if (design == null) throw new BusinessException("设计不存在");
        TeamMember ownerMembership = membershipForUserInTeam(teamId, design.getUserId());
        if (ownerMembership == null) throw new BusinessException(403, "设计不属于当前团队");
    }

    private void notifyTeamMembers(Long teamId, Long actorId, Long designId, UserDesign design,
                                   String title, String summary, String detail) {
        String designTitle = StringUtils.hasText(design.getTitle()) ? design.getTitle() : "未命名设计";
        String safeDesignTitle = escapeHtml(designTitle);
        String safeDetail = escapeHtml(detail);
        String content = "<p>设计：" + safeDesignTitle + "</p>" +
            (StringUtils.hasText(detail) ? "<p>" + safeDetail + "</p>" : "");
        List<TeamMember> members = teamMemberMapper.selectList(new LambdaQueryWrapper<TeamMember>()
            .eq(TeamMember::getTeamId, teamId).eq(TeamMember::getStatus, 1));
        for (TeamMember member : members) {
            if (Objects.equals(member.getUserId(), actorId)) continue;
            UserMessage message = new UserMessage();
            message.setUserId(member.getUserId());
            message.setCategory("collaboration");
            message.setTitle(title);
            message.setSummary(summary + "：" + designTitle);
            message.setContent(content);
            message.setLinkUrl("/editor/" + designId);
            message.setLinkText("打开设计");
            message.setIsRead(0);
            message.setStatus(1);
            message.setCreateTime(LocalDateTime.now());
            messageMapper.insert(message);
        }
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value.replace("&", "&amp;")
            .replace("<", "&lt;").replace(">", "&gt;")
            .replace("\"", "&quot;").replace("'", "&#39;");
    }

    private TeamMember membershipForUser(Long userId) {
        return teamMemberMapper.selectOne(new LambdaQueryWrapper<TeamMember>().eq(TeamMember::getUserId, userId)
            .eq(TeamMember::getStatus, 1).orderByAsc(TeamMember::getCreateTime).last("LIMIT 1"));
    }
    private TeamMember membershipForUserInTeam(Long teamId, Long userId) {
        return teamMemberMapper.selectOne(new LambdaQueryWrapper<TeamMember>().eq(TeamMember::getTeamId, teamId)
            .eq(TeamMember::getUserId, userId).eq(TeamMember::getStatus, 1).last("LIMIT 1"));
    }
    private Team createDefaultTeam(Long userId) {
        SysUser user = userMapper.selectById(userId); if (user == null) throw new BusinessException("用户不存在");
        Team team = new Team(); team.setName((StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername()) + "的团队");
        team.setOwnerId(userId); team.setMemberCount(1); team.setMaxMembers(20); team.setVersionType("free"); team.setVersionLabel("免费团队");
        team.setStorageUsedBytes(0L); team.setStorageTotalBytes(3L * 1024 * 1024 * 1024); team.setPointsBalance(50); team.setStatus(1); teamMapper.insert(team);
        TeamMember member = new TeamMember(); member.setTeamId(team.getId()); member.setUserId(userId); member.setRole("owner"); member.setStatus(1); teamMemberMapper.insert(member);
        return team;
    }
    private TeamAccess requireMember(Long teamId, Long userId) {
        Team team = teamMapper.selectById(teamId); if (team == null) throw new BusinessException("团队不存在");
        TeamMember member = membershipForUserInTeam(teamId, userId); if (member == null) throw new BusinessException(403, "不是团队成员");
        return new TeamAccess(team, member);
    }
    private void requireManager(TeamMember member) { if (!"owner".equals(member.getRole()) && !"admin".equals(member.getRole())) throw new BusinessException(403, "只有 owner/admin 可以执行此操作"); }
    private TeamOverviewDto toOverview(Team team, Long userId) { TeamOverviewDto dto = new TeamOverviewDto(); dto.setTeamId(team.getId()); dto.setName(team.getName()); dto.setOwnerId(team.getOwnerId()); dto.setMemberCount(team.getMemberCount()); dto.setMaxMembers(team.getMaxMembers()); dto.setVersionLabel(team.getVersionLabel()); TeamMember m = membershipForUserInTeam(team.getId(), userId); dto.setCurrentRole(m == null ? null : m.getRole()); dto.setMembers(listMembers(team.getId(), userId)); return dto; }
    private TeamMemberDto toMember(TeamMember m) { SysUser user = userMapper.selectById(m.getUserId()); TeamPresence p = presenceMapper.selectOne(new LambdaQueryWrapper<TeamPresence>().eq(TeamPresence::getTeamId, m.getTeamId()).eq(TeamPresence::getUserId, m.getUserId()).last("LIMIT 1")); TeamMemberDto dto = new TeamMemberDto(); dto.setUserId(m.getUserId()); if (user != null) { dto.setUsername(user.getUsername()); dto.setNickname(user.getNickname()); dto.setAvatar(user.getAvatar()); } dto.setRole(m.getRole()); dto.setStatus(m.getStatus()); if (p != null) { dto.setPresence(p.getStatus()); dto.setLastSeen(p.getLastSeen()); } return dto; }
    private TeamInvitationDto toInvitation(TeamInvitation i) { TeamInvitationDto dto = new TeamInvitationDto(); dto.setId(i.getId()); dto.setTeamId(i.getTeamId()); dto.setInviteeId(i.getInviteeId()); dto.setInviteeEmail(i.getInviteeEmail()); dto.setToken(i.getToken()); dto.setRole(i.getRole()); dto.setStatus(i.getStatus()); dto.setExpireTime(i.getExpireTime()); dto.setCreateTime(i.getCreateTime()); return dto; }
    private TeamCommentDto toComment(TeamComment c) { SysUser user = userMapper.selectById(c.getUserId()); TeamCommentDto dto = new TeamCommentDto(); dto.setId(c.getId()); dto.setDesignId(c.getDesignId()); dto.setUserId(c.getUserId()); if (user != null) { dto.setUsername(user.getUsername()); dto.setNickname(user.getNickname()); } dto.setContent(c.getContent()); dto.setParentId(c.getParentId()); dto.setCreateTime(c.getCreateTime()); return dto; }
    private TeamVersionDto toVersion(TeamDesignVersion v) { SysUser user = userMapper.selectById(v.getUserId()); TeamVersionDto dto = new TeamVersionDto(); dto.setId(v.getId()); dto.setDesignId(v.getDesignId()); dto.setVersionNo(v.getVersionNo()); dto.setUserId(v.getUserId()); if (user != null) { dto.setUsername(user.getUsername()); dto.setNickname(user.getNickname()); } dto.setCanvasJson(v.getCanvasJson()); dto.setNote(v.getNote()); dto.setCreateTime(v.getCreateTime()); return dto; }
    private TeamPresenceDto toPresence(TeamPresence p) { SysUser user = userMapper.selectById(p.getUserId()); TeamPresenceDto dto = new TeamPresenceDto(); dto.setUserId(p.getUserId()); if (user != null) { dto.setUsername(user.getUsername()); dto.setNickname(user.getNickname()); } dto.setStatus(p.getStatus()); dto.setLastSeen(p.getLastSeen()); return dto; }
    private record TeamAccess(Team team, TeamMember member) {}
}
