package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.EnterpriseAccountOverviewDto;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnterpriseService {

    private final TeamMapper teamMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final EnterpriseNavMapper navMapper;
    private final EnterpriseQuickAccessMapper quickAccessMapper;
    private final SysUserMapper userMapper;

    public EnterpriseAccountOverviewDto getAccountOverview(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        Team team = resolveTeam(userId, user);
        EnterpriseAccountOverviewDto dto = new EnterpriseAccountOverviewDto();
        dto.setPageTitle("账户概览");
        dto.setNavItems(buildNavTree());
        dto.setAccountInfo(buildAccountInfo(team));
        dto.setMembers(buildMembersBlock(team));
        dto.setStorage(buildStorageBlock(team));
        dto.setPoints(buildPointsBlock(team));
        dto.setQuickAccess(buildQuickAccess());
        dto.setPromoCard(buildPromoCard());
        return dto;
    }

    @Transactional
    protected Team resolveTeam(Long userId, SysUser user) {
        TeamMember membership = teamMemberMapper.selectOne(
            new LambdaQueryWrapper<TeamMember>()
                .eq(TeamMember::getUserId, userId)
                .eq(TeamMember::getStatus, 1)
                .last("LIMIT 1"));

        if (membership != null) {
            Team team = teamMapper.selectById(membership.getTeamId());
            if (team != null) {
                return team;
            }
        }

        Team team = new Team();
        team.setName((user.getNickname() != null ? user.getNickname() : user.getUsername()) + "的团队");
        team.setOwnerId(userId);
        team.setMemberCount(1);
        team.setMaxMembers(20);
        team.setVersionType("free");
        team.setVersionLabel("免费团队");
        team.setStorageUsedBytes(0L);
        team.setStorageTotalBytes(3L * 1024 * 1024 * 1024);
        team.setPointsBalance(50);
        team.setStatus(1);
        teamMapper.insert(team);

        TeamMember member = new TeamMember();
        member.setTeamId(team.getId());
        member.setUserId(userId);
        member.setRole("owner");
        member.setStatus(1);
        teamMemberMapper.insert(member);
        return team;
    }

    private List<EnterpriseAccountOverviewDto.NavItem> buildNavTree() {
        List<EnterpriseNav> all = navMapper.selectList(
            new LambdaQueryWrapper<EnterpriseNav>()
                .eq(EnterpriseNav::getStatus, 1)
                .orderByAsc(EnterpriseNav::getSortOrder));

        Map<Long, EnterpriseAccountOverviewDto.NavItem> map = new LinkedHashMap<>();
        List<EnterpriseAccountOverviewDto.NavItem> roots = new ArrayList<>();

        for (EnterpriseNav nav : all) {
            EnterpriseAccountOverviewDto.NavItem item = toNavItem(nav);
            map.put(nav.getId(), item);
        }

        for (EnterpriseNav nav : all) {
            EnterpriseAccountOverviewDto.NavItem item = map.get(nav.getId());
            Long parentId = nav.getParentId() != null ? nav.getParentId() : 0L;
            if (parentId == 0L) {
                roots.add(item);
            } else {
                EnterpriseAccountOverviewDto.NavItem parent = map.get(parentId);
                if (parent != null) {
                    parent.getChildren().add(item);
                } else {
                    roots.add(item);
                }
            }
        }
        return roots;
    }

    private EnterpriseAccountOverviewDto.NavItem toNavItem(EnterpriseNav nav) {
        EnterpriseAccountOverviewDto.NavItem item = new EnterpriseAccountOverviewDto.NavItem();
        item.setId(nav.getId());
        item.setName(nav.getName());
        item.setCode(nav.getCode());
        item.setRoutePath(nav.getRoutePath());
        item.setBadgeText(nav.getBadgeText());
        return item;
    }

    private EnterpriseAccountOverviewDto.AccountInfo buildAccountInfo(Team team) {
        EnterpriseAccountOverviewDto.AccountInfo info = new EnterpriseAccountOverviewDto.AccountInfo();
        info.setTeamName(team.getName());
        info.setTeamIdLabel(String.valueOf(team.getId()));
        info.setVersionLabel(team.getVersionLabel() != null ? team.getVersionLabel() : "免费团队");
        info.setAvatarText(String.valueOf(team.getMemberCount() != null ? team.getMemberCount() : 1));
        info.setVipCtaText("开通会员");
        info.setVipCtaLink("/price/vip");
        info.setFlagshipCtaText("升级旗舰版");
        info.setFlagshipCtaLink("/price/vip?type=team&plan=flagship");
        return info;
    }

    private EnterpriseAccountOverviewDto.MembersBlock buildMembersBlock(Team team) {
        int current = team.getMemberCount() != null ? team.getMemberCount() : 1;
        int max = team.getMaxMembers() != null ? team.getMaxMembers() : 20;
        EnterpriseAccountOverviewDto.MembersBlock block = new EnterpriseAccountOverviewDto.MembersBlock();
        block.setCurrent(current);
        block.setMax(max);
        block.setPercent(max > 0 ? Math.min(100, current * 100 / max) : 0);
        block.setManageRoute("/designtools/enterprise/members");
        return block;
    }

    private EnterpriseAccountOverviewDto.StorageBlock buildStorageBlock(Team team) {
        long used = team.getStorageUsedBytes() != null ? team.getStorageUsedBytes() : 0L;
        long total = team.getStorageTotalBytes() != null ? team.getStorageTotalBytes() : 3221225472L;
        int percent = total > 0 ? (int) Math.min(100, used * 100 / total) : 0;

        EnterpriseAccountOverviewDto.StorageBlock block = new EnterpriseAccountOverviewDto.StorageBlock();
        block.setUsedLabel(formatBytes(used));
        block.setTotalLabel(formatBytesShort(total));
        block.setPercent(percent);
        block.setExpandLink("/price/vip?type=team");
        block.setDetailRoute("/designtools/enterprise/usage");
        return block;
    }

    private EnterpriseAccountOverviewDto.PointsBlock buildPointsBlock(Team team) {
        EnterpriseAccountOverviewDto.PointsBlock block = new EnterpriseAccountOverviewDto.PointsBlock();
        block.setBalance(team.getPointsBalance() != null ? team.getPointsBalance() : 0);
        block.setBuyLink("/price/vip?type=team");
        block.setDetailRoute("/designtools/enterprise/usage");
        return block;
    }

    private List<EnterpriseAccountOverviewDto.QuickAccessItem> buildQuickAccess() {
        return quickAccessMapper.selectList(
            new LambdaQueryWrapper<EnterpriseQuickAccess>()
                .eq(EnterpriseQuickAccess::getStatus, 1)
                .orderByAsc(EnterpriseQuickAccess::getSortOrder))
            .stream()
            .map(q -> {
                EnterpriseAccountOverviewDto.QuickAccessItem item = new EnterpriseAccountOverviewDto.QuickAccessItem();
                item.setCode(q.getCode());
                item.setName(q.getName());
                item.setDescription(q.getDescription());
                item.setIcon(q.getIcon());
                item.setRoutePath(q.getRoutePath());
                return item;
            })
            .collect(Collectors.toList());
    }

    private EnterpriseAccountOverviewDto.PromoCard buildPromoCard() {
        EnterpriseAccountOverviewDto.PromoCard card = new EnterpriseAccountOverviewDto.PromoCard();
        card.setTitle("升级旗舰版");
        card.setSubtitle("享更多积分");
        card.setBadgeText("免费体验");
        card.setCtaText("立即升级");
        card.setCtaLink("/price/vip?type=team");
        return card;
    }

    private String formatBytes(long bytes) {
        if (bytes >= 1024L * 1024 * 1024) {
            return String.format("%.2fG", bytes / (1024.0 * 1024 * 1024));
        }
        if (bytes >= 1024 * 1024) {
            return String.format("%.2fM", bytes / (1024.0 * 1024));
        }
        if (bytes >= 1024) {
            return String.format("%.2fK", bytes / 1024.0);
        }
        return bytes + "B";
    }

    private String formatBytesShort(long bytes) {
        if (bytes >= 1024L * 1024 * 1024) {
            return String.format("%.0fG", bytes / (1024.0 * 1024 * 1024));
        }
        if (bytes >= 1024 * 1024) {
            return String.format("%.0fM", bytes / (1024.0 * 1024));
        }
        return formatBytes(bytes);
    }
}
