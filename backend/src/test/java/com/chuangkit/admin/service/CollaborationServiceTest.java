package com.chuangkit.admin.service;

import com.chuangkit.admin.dto.TeamCommentRequest;
import com.chuangkit.admin.dto.TeamVersionRequest;
import com.chuangkit.admin.entity.Team;
import com.chuangkit.admin.entity.TeamComment;
import com.chuangkit.admin.entity.TeamDesignVersion;
import com.chuangkit.admin.entity.TeamMember;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.mapper.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CollaborationServiceTest {

    @Mock private TeamMapper teamMapper;
    @Mock private TeamMemberMapper teamMemberMapper;
    @Mock private TeamInvitationMapper invitationMapper;
    @Mock private TeamCommentMapper commentMapper;
    @Mock private TeamDesignVersionMapper versionMapper;
    @Mock private TeamPresenceMapper presenceMapper;
    @Mock private SysUserMapper userMapper;
    @Mock private UserDesignMapper designMapper;
    @Mock private UserMessageMapper messageMapper;

    @InjectMocks
    private CollaborationService collaborationService;

    @Test
    void commentNotificationIsCreatedForOtherTeamMembers() {
        Team team = team(10L);
        UserDesign design = design(42L, 7L);
        when(teamMapper.selectById(10L)).thenReturn(team);
        when(designMapper.selectById(42L)).thenReturn(design);
        when(teamMemberMapper.selectOne(any())).thenReturn(member(10L, 7L, "owner"));
        when(teamMemberMapper.selectList(any())).thenReturn(List.of(
            member(10L, 7L, "owner"), member(10L, 8L, "member")));

        TeamCommentRequest request = new TeamCommentRequest();
        request.setContent("请确认标题");
        collaborationService.addComment(10L, 42L, 7L, request);

        verify(messageMapper).insert(any());
    }

    @Test
    void versionNotificationIsCreatedForOtherTeamMembers() {
        Team team = team(10L);
        UserDesign design = design(42L, 7L);
        when(teamMapper.selectById(10L)).thenReturn(team);
        when(designMapper.selectById(42L)).thenReturn(design);
        when(teamMemberMapper.selectOne(any())).thenReturn(member(10L, 7L, "owner"));
        when(teamMemberMapper.selectList(any())).thenReturn(List.of(
            member(10L, 7L, "owner"), member(10L, 8L, "member")));
        when(versionMapper.selectList(any())).thenReturn(List.of());

        TeamVersionRequest request = new TeamVersionRequest();
        request.setCanvasJson("{}");
        collaborationService.createVersion(10L, 42L, 7L, request);

        verify(messageMapper).insert(any());
    }

    private Team team(Long id) { Team team = new Team(); team.setId(id); team.setName("设计团队"); return team; }
    private UserDesign design(Long id, Long ownerId) { UserDesign design = new UserDesign(); design.setId(id); design.setUserId(ownerId); return design; }
    private TeamMember member(Long teamId, Long userId, String role) { TeamMember member = new TeamMember(); member.setTeamId(teamId); member.setUserId(userId); member.setRole(role); member.setStatus(1); return member; }
}
