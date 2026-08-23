package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.chuangkit.admin.dto.CouponCenterCouponVo;
import com.chuangkit.admin.dto.CouponCenterIndexDto;
import com.chuangkit.admin.dto.CouponCenterListDto;
import com.chuangkit.admin.entity.UserCoupon;
import com.chuangkit.admin.mapper.UserCouponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CouponCenterService {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private static final Map<String, Integer> STATUS_CODES = Map.of(
        "unused", 0,
        "used", 1,
        "expired", 2
    );

    private static final Map<Integer, String> STATUS_LABELS = Map.of(
        0, "未使用",
        1, "已使用",
        2, "已过期"
    );

    private final UserCouponMapper couponMapper;

    public CouponCenterIndexDto getIndex(Long userId) {
        CouponCenterIndexDto dto = new CouponCenterIndexDto();
        dto.setPageTitle("优惠券");
        dto.setBreadcrumbParent("账号中心");
        dto.setBreadcrumbCurrent("优惠券");
        dto.setBackText("返回");
        dto.setInstructionsTitle("优惠券说明");
        dto.setInstructionsContent(
            "1. 优惠券仅限本人账号使用，不可转让。\n"
                + "2. 每笔订单仅可使用一张优惠券。\n"
                + "3. 优惠券需在有效期内使用，过期自动失效。\n"
                + "4. 部分优惠券有最低消费金额限制，请留意使用条件。"
        );
        dto.setTabs(buildTabs(userId));
        return dto;
    }

    public CouponCenterListDto listCoupons(Long userId, String status, int page, int pageSize) {
        syncExpiredCoupons(userId);

        Integer statusCode = resolveStatusCode(status);
        LambdaQueryWrapper<UserCoupon> qw = new LambdaQueryWrapper<UserCoupon>()
            .eq(UserCoupon::getUserId, userId);
        if (statusCode != null) {
            qw.eq(UserCoupon::getStatus, statusCode);
        }
        qw.orderByDesc(UserCoupon::getCreateTime);

        Page<UserCoupon> p = couponMapper.selectPage(new Page<>(page, pageSize), qw);
        CouponCenterListDto dto = new CouponCenterListDto();
        dto.setList(p.getRecords().stream().map(this::toVo).toList());
        dto.setTotal(p.getTotal());
        dto.setPage(p.getCurrent());
        dto.setPageSize(p.getSize());
        dto.setTotalPages(p.getPages());
        return dto;
    }

    private void syncExpiredCoupons(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<UserCoupon> expiredCandidates = couponMapper.selectList(
            new LambdaQueryWrapper<UserCoupon>()
                .eq(UserCoupon::getUserId, userId)
                .eq(UserCoupon::getStatus, 0)
                .lt(UserCoupon::getExpireTime, now));
        for (UserCoupon coupon : expiredCandidates) {
            coupon.setStatus(2);
            couponMapper.updateById(coupon);
        }
    }

    private List<CouponCenterIndexDto.StatusTab> buildTabs(Long userId) {
        syncExpiredCoupons(userId);
        return List.of(
            tab("unused", "未使用", "暂无可用优惠券", countByStatus(userId, 0)),
            tab("used", "已使用", "暂无已使用优惠券", countByStatus(userId, 1)),
            tab("expired", "已过期", "暂无已过期优惠券", countByStatus(userId, 2))
        );
    }

    private CouponCenterIndexDto.StatusTab tab(String code, String name, String emptyText, int count) {
        CouponCenterIndexDto.StatusTab tab = new CouponCenterIndexDto.StatusTab();
        tab.setCode(code);
        tab.setName(name);
        tab.setEmptyText(emptyText);
        tab.setCount(count);
        return tab;
    }

    private int countByStatus(Long userId, int status) {
        Long count = couponMapper.selectCount(
            new LambdaQueryWrapper<UserCoupon>()
                .eq(UserCoupon::getUserId, userId)
                .eq(UserCoupon::getStatus, status));
        return count != null ? count.intValue() : 0;
    }

    private Integer resolveStatusCode(String status) {
        if (!StringUtils.hasText(status)) {
            return 0;
        }
        return STATUS_CODES.get(status.trim());
    }

    private CouponCenterCouponVo toVo(UserCoupon coupon) {
        CouponCenterCouponVo vo = new CouponCenterCouponVo();
        vo.setId(coupon.getId());
        vo.setTitle(coupon.getTitle());
        vo.setCouponCode(coupon.getCouponCode());
        vo.setDiscountType(coupon.getDiscountType());
        vo.setDiscountLabel(formatDiscount(coupon.getDiscountType(), coupon.getDiscountValue()));
        vo.setMinAmountLabel(formatMinAmount(coupon.getMinAmount()));
        vo.setScopeLabel(coupon.getScopeLabel());
        vo.setStatus(resolveStatusKey(coupon.getStatus()));
        vo.setStatusLabel(STATUS_LABELS.getOrDefault(coupon.getStatus(), "未使用"));
        vo.setExpireTime(formatDateTime(coupon.getExpireTime()));
        vo.setUsedTime(formatDateTime(coupon.getUsedTime()));
        return vo;
    }

    private String resolveStatusKey(Integer status) {
        if (status == null) return "unused";
        return switch (status) {
            case 1 -> "used";
            case 2 -> "expired";
            default -> "unused";
        };
    }

    private String formatDiscount(String type, Integer value) {
        if (value == null) return "-";
        if ("percent".equals(type)) {
            if (value % 10 == 0 && value >= 10) {
                return value / 10 + "折";
            }
            return value + "%";
        }
        return "¥" + formatMoney(value);
    }

    private String formatMinAmount(Integer minAmount) {
        if (minAmount == null || minAmount <= 0) {
            return "无门槛";
        }
        return "满¥" + formatMoney(minAmount) + "可用";
    }

    private String formatMoney(int cents) {
        if (cents % 100 == 0) {
            return String.valueOf(cents / 100);
        }
        return String.format("%.2f", cents / 100.0);
    }

    private String formatDateTime(LocalDateTime time) {
        return time == null ? "" : time.format(DATE_TIME);
    }
}
