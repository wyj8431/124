package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.UsageQuotaDto;
import com.chuangkit.admin.entity.SysUser;
import com.chuangkit.admin.entity.UserUsageDaily;
import com.chuangkit.admin.mapper.SysUserMapper;
import com.chuangkit.admin.mapper.UserUsageDailyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UsageQuotaService {

    public static final int FREE_DAILY_LIMIT = 1;
    private final UserUsageDailyMapper usageMapper;
    private final SysUserMapper userMapper;

    public UsageQuotaDto getStatus(Long userId) {
        UserUsageDaily usage = findToday(userId);
        boolean unlimited = isUnlimited(userId);
        UsageQuotaDto dto = new UsageQuotaDto();
        dto.setUsageDate(LocalDate.now().toString());
        dto.setUnlimited(unlimited);
        dto.setLimit(unlimited ? -1 : FREE_DAILY_LIMIT);
        dto.setCreateUsed(value(usage == null ? null : usage.getCreateCount()));
        dto.setSaveUsed(value(usage == null ? null : usage.getSaveCount()));
        dto.setExportUsed(value(usage == null ? null : usage.getExportCount()));
        dto.setCreateRemaining(unlimited ? -1 : remaining(dto.getCreateUsed()));
        dto.setSaveRemaining(unlimited ? -1 : remaining(dto.getSaveUsed()));
        dto.setExportRemaining(unlimited ? -1 : remaining(dto.getExportUsed()));
        return dto;
    }

    @Transactional
    public void consume(Long userId, String action) {
        String normalized = action == null ? "" : action.trim().toLowerCase();
        if (!normalized.equals("create") && !normalized.equals("save") && !normalized.equals("export")) {
            throw new BusinessException("不支持的额度类型");
        }
        if (isUnlimited(userId)) return;

        UserUsageDaily usage = findToday(userId);
        if (usage == null) {
            usage = new UserUsageDaily();
            usage.setUserId(userId);
            usage.setUsageDate(LocalDate.now());
            usage.setCreateCount(0);
            usage.setSaveCount(0);
            usage.setExportCount(0);
            usageMapper.insert(usage);
        }

        int used = switch (normalized) {
            case "create" -> value(usage.getCreateCount());
            case "save" -> value(usage.getSaveCount());
            default -> value(usage.getExportCount());
        };
        if (used >= FREE_DAILY_LIMIT) {
            throw new BusinessException(429, "今日免费额度已用完，请升级会员后继续使用");
        }
        switch (normalized) {
            case "create" -> usage.setCreateCount(used + 1);
            case "save" -> usage.setSaveCount(used + 1);
            default -> usage.setExportCount(used + 1);
        }
        usageMapper.updateById(usage);
    }

    private UserUsageDaily findToday(Long userId) {
        return usageMapper.selectOne(new LambdaQueryWrapper<UserUsageDaily>()
            .eq(UserUsageDaily::getUserId, userId)
            .eq(UserUsageDaily::getUsageDate, LocalDate.now()));
    }

    private boolean isUnlimited(Long userId) {
        SysUser user = userMapper.selectById(userId);
        return user != null && user.getMemberLevel() != null && user.getMemberLevel() > 0;
    }

    private int remaining(int used) {
        return Math.max(0, FREE_DAILY_LIMIT - used);
    }

    private int value(Integer value) {
        return value == null ? 0 : value;
    }
}
