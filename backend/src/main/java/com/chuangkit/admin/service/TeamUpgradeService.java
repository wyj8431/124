package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.TeamUpgradeModalDto;
import com.chuangkit.admin.dto.TeamUpgradeSubmitRequest;
import com.chuangkit.admin.dto.TeamUpgradeSubmitResult;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamUpgradeService {

    private final TeamUpgradeConfigMapper configMapper;
    private final TeamUpgradeSizeOptionMapper sizeOptionMapper;
    private final TeamMapper teamMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final SysUserMapper userMapper;
    private final ObjectMapper objectMapper;

    public TeamUpgradeModalDto getModal(Long userId) {
        TeamUpgradeConfig config = configMapper.selectById(1L);
        if (config == null) {
            throw new BusinessException("团队升级弹窗配置不存在");
        }

        TeamUpgradeModalDto dto = new TeamUpgradeModalDto();
        dto.setFormTitle(config.getFormTitle());
        dto.setSizeLabel(config.getSizeLabel());
        dto.setCtaText(config.getCtaText());
        dto.setCtaBadge(config.getCtaBadge());
        dto.setPersonalLabel(config.getPersonalLabel());
        dto.setTeamLabel(config.getTeamLabel());
        dto.setRedirectPath(config.getRedirectPath());

        TeamUpgradeModalDto.LeftPanel leftPanel = new TeamUpgradeModalDto.LeftPanel();
        leftPanel.setTitle(config.getLeftTitle());
        leftPanel.setTags(parseStringList(config.getLeftTags()));
        leftPanel.setCollage(parseStringList(config.getLeftCollage()));
        leftPanel.setFeatures(parseFeatures(config.getLeftFeatures()));
        dto.setLeftPanel(leftPanel);

        List<TeamUpgradeSizeOption> options = sizeOptionMapper.selectList(
            new LambdaQueryWrapper<TeamUpgradeSizeOption>()
                .eq(TeamUpgradeSizeOption::getStatus, 1)
                .orderByAsc(TeamUpgradeSizeOption::getSortOrder));

        for (TeamUpgradeSizeOption option : options) {
            TeamUpgradeModalDto.SizeOption item = new TeamUpgradeModalDto.SizeOption();
            item.setCode(option.getCode());
            item.setLabel(option.getLabel());
            dto.getSizeOptions().add(item);
        }

        if (userId != null) {
            dto.setUserPreview(buildUserPreview(userId));
        }

        return dto;
    }

    @Transactional
    public TeamUpgradeSubmitResult submit(Long userId, TeamUpgradeSubmitRequest request) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        TeamUpgradeSizeOption sizeOption = sizeOptionMapper.selectOne(
            new LambdaQueryWrapper<TeamUpgradeSizeOption>()
                .eq(TeamUpgradeSizeOption::getCode, request.getSizeCode())
                .eq(TeamUpgradeSizeOption::getStatus, 1));

        if (sizeOption == null) {
            throw new BusinessException("请选择团队人数");
        }

        TeamUpgradeConfig config = configMapper.selectById(1L);
        String redirectPath = config != null && config.getRedirectPath() != null
            ? config.getRedirectPath()
            : "/designtools/enterprise/accountOverview";

        TeamMember membership = teamMemberMapper.selectOne(
            new LambdaQueryWrapper<TeamMember>()
                .eq(TeamMember::getUserId, userId)
                .eq(TeamMember::getStatus, 1)
                .last("LIMIT 1"));

        Team team;
        if (membership != null) {
            team = teamMapper.selectById(membership.getTeamId());
            if (team == null) {
                team = createTeam(user, sizeOption);
            } else {
                team.setMaxMembers(sizeOption.getMaxMembers());
                team.setVersionType("free");
                team.setVersionLabel("免费团队");
                teamMapper.updateById(team);
            }
        } else {
            team = createTeam(user, sizeOption);
        }

        TeamUpgradeSubmitResult result = new TeamUpgradeSubmitResult();
        result.setTeamName(team.getName());
        result.setRedirectPath(redirectPath);
        result.setMessage("升级成功");
        return result;
    }

    private Team createTeam(SysUser user, TeamUpgradeSizeOption sizeOption) {
        String account = resolveAccount(user);
        Team team = new Team();
        team.setName(truncateTeamName(account) + " 的团队");
        team.setOwnerId(user.getId());
        team.setMemberCount(1);
        team.setMaxMembers(sizeOption.getMaxMembers());
        team.setVersionType("free");
        team.setVersionLabel("免费团队");
        team.setStorageUsedBytes(0L);
        team.setStorageTotalBytes(3L * 1024 * 1024 * 1024);
        team.setPointsBalance(50);
        team.setStatus(1);
        teamMapper.insert(team);

        TeamMember member = new TeamMember();
        member.setTeamId(team.getId());
        member.setUserId(user.getId());
        member.setRole("owner");
        member.setStatus(1);
        teamMemberMapper.insert(member);
        return team;
    }

    private TeamUpgradeModalDto.UserPreview buildUserPreview(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }

        String account = resolveAccount(user);
        TeamUpgradeModalDto.UserPreview preview = new TeamUpgradeModalDto.UserPreview();
        preview.setMaskedAccount(maskAccount(account));
        preview.setAvatar(user.getAvatar());
        preview.setTeamName(truncateTeamName(account) + " 的团队");
        preview.setTeamAvatarText("1");
        return preview;
    }

    private String resolveAccount(SysUser user) {
        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            return user.getPhone().trim();
        }
        return user.getUsername() != null ? user.getUsername().trim() : "用户";
    }

    private String maskAccount(String account) {
        String digits = account.replaceAll("\\D", "");
        if (digits.length() >= 11) {
            return digits.substring(0, 3) + "****" + digits.substring(digits.length() - 4);
        }
        if (digits.length() >= 7) {
            return digits.substring(0, 3) + "****" + digits.substring(digits.length() - 3);
        }
        if (account.length() <= 4) {
            return account.charAt(0) + "***";
        }
        return account.substring(0, 3) + "****" + account.substring(account.length() - 2);
    }

    private String truncateTeamName(String account) {
        String masked = maskAccount(account);
        if (masked.length() > 9) {
            return masked.substring(0, 9) + "...";
        }
        return masked;
    }

    private List<String> parseStringList(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<List<String>>() {});
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    private List<TeamUpgradeModalDto.FeatureItem> parseFeatures(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<List<TeamUpgradeModalDto.FeatureItem>>() {});
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }
}
