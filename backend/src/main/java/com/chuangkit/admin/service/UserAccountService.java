package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.AccountPanelDto;
import com.chuangkit.admin.entity.SysUser;
import com.chuangkit.admin.entity.UserDesign;
import com.chuangkit.admin.mapper.SysUserMapper;
import com.chuangkit.admin.mapper.UserDesignMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAccountService {

    private static final long STORAGE_TOTAL_BYTES = 3L * 1024 * 1024 * 1024;
    private static final long AVG_DESIGN_BYTES = 2L * 1024 * 1024;

    private final SysUserMapper userMapper;
    private final UserDesignMapper designMapper;

    public AccountPanelDto getAccountPanel(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        AccountPanelDto panel = new AccountPanelDto();
        panel.setUser(buildUserBlock(user));
        panel.setMember(buildMemberBlock(user));
        panel.setStorage(buildStorageBlock(userId));
        panel.setAiCredits(buildAiCreditsBlock(user));
        panel.setAccountSwitcher(buildAccountSwitcherBlock(user));
        panel.setMenuItems(buildMenuItems());
        return panel;
    }

    private AccountPanelDto.UserBlock buildUserBlock(SysUser user) {
        AccountPanelDto.UserBlock block = new AccountPanelDto.UserBlock();
        block.setId(user.getId());
        block.setAvatar(user.getAvatar());
        block.setDisplayName(resolveDisplayName(user));
        block.setRoleLabel("创建者");
        block.setUserIdLabel(String.valueOf(user.getId()));
        return block;
    }

    private AccountPanelDto.MemberBlock buildMemberBlock(SysUser user) {
        int level = user.getMemberLevel() != null ? user.getMemberLevel() : 0;
        AccountPanelDto.MemberBlock block = new AccountPanelDto.MemberBlock();
        block.setLevelName(switch (level) {
            case 1 -> "VIP版";
            case 2 -> "团队版";
            default -> "免费版";
        });
        block.setTitle("开通会员尊享专属特权");
        block.setSubtitle("100万+模板 · 商用授权 · 无水印下载");
        block.setCtaText(level > 0 ? "续费会员" : "立即开通");
        block.setCtaLink("/price/vip");
        return block;
    }

    private AccountPanelDto.StorageBlock buildStorageBlock(Long userId) {
        long count = designMapper.selectCount(
            new LambdaQueryWrapper<UserDesign>()
                .eq(UserDesign::getUserId, userId)
                .eq(UserDesign::getDeleted, 0));
        long usedBytes = Math.max(count * AVG_DESIGN_BYTES, count > 0 ? 1024 * 1024 : 0);
        int percent = (int) Math.min(100, usedBytes * 100 / STORAGE_TOTAL_BYTES);

        AccountPanelDto.StorageBlock block = new AccountPanelDto.StorageBlock();
        block.setUsedBytes(usedBytes);
        block.setTotalBytes(STORAGE_TOTAL_BYTES);
        block.setUsedLabel(formatBytes(usedBytes));
        block.setTotalLabel("3G");
        block.setPercent(percent);
        return block;
    }

    private AccountPanelDto.AiCreditsBlock buildAiCreditsBlock(SysUser user) {
        int level = user.getMemberLevel() != null ? user.getMemberLevel() : 0;
        AccountPanelDto.AiCreditsBlock block = new AccountPanelDto.AiCreditsBlock();
        block.setBalance(switch (level) {
            case 1 -> 500;
            case 2 -> 2000;
            default -> 50;
        });
        block.setTip("会员每月免费领取积分 >");
        return block;
    }

    private AccountPanelDto.AccountSwitcherBlock buildAccountSwitcherBlock(SysUser user) {
        AccountPanelDto.AccountSwitcherBlock block = new AccountPanelDto.AccountSwitcherBlock();
        block.setDisplayName(resolveDisplayName(user));
        block.setVersionLabel("个人版");
        block.setCreateTeamText("+ 创建团队");
        block.setTrialBadge("免费体验");
        return block;
    }

    private List<AccountPanelDto.MenuItem> buildMenuItems() {
        return List.of(
            item("team", "团队管理", "team", "/designtools/enterprise/accountOverview"),
            item("order", "订单/发票", "order", "/usercenter/vip"),
            item("auth", "我的授权记录", "auth", "/auth_record/design_record"),
            item("message", "消息中心", "message", "/message-center"),
            item("coupon", "我的优惠券", "coupon", "/userquan")
        );
    }

    private AccountPanelDto.MenuItem item(String code, String name, String icon, String route) {
        AccountPanelDto.MenuItem item = new AccountPanelDto.MenuItem();
        item.setCode(code);
        item.setName(name);
        item.setIcon(icon);
        item.setRoutePath(route);
        return item;
    }

    private String resolveDisplayName(SysUser user) {
        if (StringUtils.hasText(user.getPhone())) {
            return maskPhone(user.getPhone());
        }
        if (StringUtils.hasText(user.getNickname())) {
            return user.getNickname();
        }
        return user.getUsername();
    }

    private String maskPhone(String phone) {
        if (phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    private String formatBytes(long bytes) {
        if (bytes >= 1024L * 1024 * 1024) {
            return String.format("%.1fG", bytes / (1024.0 * 1024 * 1024));
        }
        if (bytes >= 1024 * 1024) {
            return String.format("%.1fM", bytes / (1024.0 * 1024));
        }
        if (bytes >= 1024) {
            return String.format("%.1fK", bytes / 1024.0);
        }
        return bytes + "B";
    }
}
