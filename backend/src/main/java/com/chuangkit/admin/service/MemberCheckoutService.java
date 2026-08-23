package com.chuangkit.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chuangkit.admin.common.GlobalExceptionHandler.BusinessException;
import com.chuangkit.admin.dto.MemberOrderCreateRequest;
import com.chuangkit.admin.dto.MemberOrderVo;
import com.chuangkit.admin.dto.MembershipCheckoutDto;
import com.chuangkit.admin.entity.*;
import com.chuangkit.admin.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberCheckoutService {

    private final SysUserMapper userMapper;
    private final MemberTierMapper tierMapper;
    private final MemberSkuMapper skuMapper;
    private final MemberBenefitMapper benefitMapper;
    private final MemberOrderMapper orderMapper;
    private final AuthRecordService authRecordService;

    public MembershipCheckoutDto getCheckoutIndex(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        MembershipCheckoutDto dto = new MembershipCheckoutDto();
        dto.setUser(buildUserBlock(user));
        dto.setGroups(buildGroups());
        return dto;
    }

    public MemberOrderVo createOrder(Long userId, MemberOrderCreateRequest req) {
        MemberSku sku = skuMapper.selectById(req.getSkuId());
        if (sku == null || sku.getStatus() == null || sku.getStatus() != 1) {
            throw new BusinessException("套餐不存在");
        }
        MemberTier tier = tierMapper.selectById(sku.getTierId());
        if (tier == null) {
            throw new BusinessException("会员版本不存在");
        }

        int seats = req.getSeatCount() != null ? req.getSeatCount() : 1;
        int minSeats = tier.getMinSeats() != null ? tier.getMinSeats() : 1;
        int maxSeats = tier.getMaxSeats() != null ? tier.getMaxSeats() : 1;
        if (seats < minSeats || seats > maxSeats) {
            throw new BusinessException("席位数需在 " + minSeats + "~" + maxSeats + " 之间");
        }

        boolean perPerson = "team".equals(tier.getGroupCode());
        int unitPrice = sku.getPriceCents();
        int total = unitPrice * seats;
        Integer original = sku.getOriginalPriceCents() != null ? sku.getOriginalPriceCents() * seats : null;

        String orderNo = "CKT" + System.currentTimeMillis() + userId;
        LocalDate validUntil = calcValidUntil(sku.getDurationMonths());

        MemberOrder order = new MemberOrder();
        order.setOrderNo(orderNo);
        order.setUserId(userId);
        order.setSkuId(sku.getId());
        order.setSeatCount(seats);
        order.setTotalPriceCents(total);
        order.setOriginalPriceCents(original);
        order.setPayMethod(req.getPayMethod());
        order.setStatus("pending");
        order.setValidUntil(validUntil);
        order.setQrPayload("ckt-pay://" + orderNo);
        orderMapper.insert(order);

        return toOrderVo(order, sku, perPerson);
    }

    public MemberOrderVo getOrderStatus(Long userId, Long orderId) {
        MemberOrder order = orderMapper.selectById(orderId);
        if (order == null || !Objects.equals(order.getUserId(), userId)) {
            throw new BusinessException("订单不存在");
        }
        MemberSku sku = skuMapper.selectById(order.getSkuId());
        MemberOrderVo vo = new MemberOrderVo();
        vo.setOrderId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setTotalPrice(order.getTotalPriceCents() / 100);
        vo.setStatus(order.getStatus());
        vo.setPayMethod(order.getPayMethod());
        if (order.getOriginalPriceCents() != null) {
            vo.setOriginalPrice(order.getOriginalPriceCents() / 100);
            vo.setSavedAmount(vo.getOriginalPrice() - vo.getTotalPrice());
        }
        if (order.getValidUntil() != null) {
            vo.setValidUntilLabel(formatValidUntil(order.getValidUntil()));
        }
        if (sku != null) {
            vo.setAutoRenewTip(sku.getAutoRenewTip());
            vo.setQrCodeUrl(buildQrUrl(order.getQrPayload()));
        }
        return vo;
    }

    public MemberOrderVo simulatePay(Long userId, Long orderId) {
        MemberOrder order = orderMapper.selectById(orderId);
        if (order == null || !Objects.equals(order.getUserId(), userId)) {
            throw new BusinessException("订单不存在");
        }
        if (!"pending".equals(order.getStatus())) {
            throw new BusinessException("订单状态不可支付");
        }
        order.setStatus("paid");
        order.setPayTime(java.time.LocalDateTime.now());
        orderMapper.updateById(order);

        MemberSku sku = skuMapper.selectById(order.getSkuId());
        if (sku != null) {
            MemberTier tier = tierMapper.selectById(sku.getTierId());
            SysUser user = userMapper.selectById(userId);
            if (user != null && tier != null) {
                int level = "team".equals(tier.getGroupCode()) ? 2 : 1;
                user.setMemberLevel(level);
                userMapper.updateById(user);
                authRecordService.syncOnMemberPay(userId);
            }
        }
        return getOrderStatus(userId, orderId);
    }

    private MembershipCheckoutDto.UserBlock buildUserBlock(SysUser user) {
        MembershipCheckoutDto.UserBlock block = new MembershipCheckoutDto.UserBlock();
        block.setAvatar(user.getAvatar());
        block.setDisplayName(resolveDisplayName(user));
        block.setLevelLabel(switch (user.getMemberLevel() != null ? user.getMemberLevel() : 0) {
            case 1 -> "VIP会员";
            case 2 -> "团队版";
            default -> "普通用户";
        });
        block.setSlogan("模板在线编辑，快速出图");
        return block;
    }

    private List<MembershipCheckoutDto.GroupBlock> buildGroups() {
        List<MemberTier> tiers = tierMapper.selectList(
            new LambdaQueryWrapper<MemberTier>()
                .eq(MemberTier::getStatus, 1)
                .orderByAsc(MemberTier::getGroupCode)
                .orderByAsc(MemberTier::getSortOrder));

        Map<String, MembershipCheckoutDto.GroupBlock> groupMap = new LinkedHashMap<>();
        for (MemberTier tier : tiers) {
            MembershipCheckoutDto.GroupBlock group = groupMap.computeIfAbsent(tier.getGroupCode(), code -> {
                MembershipCheckoutDto.GroupBlock g = new MembershipCheckoutDto.GroupBlock();
                g.setCode(code);
                if ("team".equals(code)) {
                    g.setTitle("团队用");
                    g.setSubtitle("2~20人");
                    g.setMinSeats(2);
                    g.setMaxSeats(20);
                } else {
                    g.setTitle("单人用");
                    g.setSubtitle("1人");
                    g.setMinSeats(1);
                    g.setMaxSeats(1);
                }
                return g;
            });

            MembershipCheckoutDto.TierBlock tierBlock = new MembershipCheckoutDto.TierBlock();
            tierBlock.setId(tier.getId());
            tierBlock.setCode(tier.getCode());
            tierBlock.setName(tier.getName());
            tierBlock.setDescription(tier.getDescription());
            tierBlock.setMinSeats(tier.getMinSeats());
            tierBlock.setMaxSeats(tier.getMaxSeats());
            tierBlock.setSkus(loadSkus(tier));
            tierBlock.setBenefits(loadBenefits(tier.getId()));
            group.getTiers().add(tierBlock);
        }
        return new ArrayList<>(groupMap.values());
    }

    private List<MembershipCheckoutDto.SkuBlock> loadSkus(MemberTier tier) {
        boolean perPerson = "team".equals(tier.getGroupCode());
        return skuMapper.selectList(
            new LambdaQueryWrapper<MemberSku>()
                .eq(MemberSku::getTierId, tier.getId())
                .eq(MemberSku::getStatus, 1)
                .orderByAsc(MemberSku::getSortOrder))
            .stream()
            .map(s -> {
                MembershipCheckoutDto.SkuBlock block = new MembershipCheckoutDto.SkuBlock();
                block.setId(s.getId());
                block.setName(s.getName());
                block.setPrice(s.getPriceCents() / 100);
                block.setOriginalPrice(s.getOriginalPriceCents() != null ? s.getOriginalPriceCents() / 100 : null);
                block.setBadgeText(s.getBadgeText());
                block.setFooterText(s.getFooterText());
                block.setPerMonthText(s.getPerMonthText());
                block.setDurationMonths(s.getDurationMonths());
                block.setAutoRenew(s.getIsAutoRenew() != null && s.getIsAutoRenew() == 1);
                block.setAutoRenewTip(s.getAutoRenewTip());
                block.setPerPerson(perPerson);
                return block;
            })
            .collect(Collectors.toList());
    }

    private List<MembershipCheckoutDto.BenefitBlock> loadBenefits(Long tierId) {
        return benefitMapper.selectList(
            new LambdaQueryWrapper<MemberBenefit>()
                .eq(MemberBenefit::getTierId, tierId)
                .eq(MemberBenefit::getStatus, 1)
                .orderByAsc(MemberBenefit::getSortOrder))
            .stream()
            .map(b -> {
                MembershipCheckoutDto.BenefitBlock block = new MembershipCheckoutDto.BenefitBlock();
                block.setTitle(b.getTitle());
                block.setDescription(b.getDescription());
                block.setIcon(b.getIcon());
                return block;
            })
            .collect(Collectors.toList());
    }

    private MemberOrderVo toOrderVo(MemberOrder order, MemberSku sku, boolean perPerson) {
        MemberOrderVo vo = new MemberOrderVo();
        vo.setOrderId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setTotalPrice(order.getTotalPriceCents() / 100);
        if (order.getOriginalPriceCents() != null) {
            vo.setOriginalPrice(order.getOriginalPriceCents() / 100);
            vo.setSavedAmount(vo.getOriginalPrice() - vo.getTotalPrice());
        }
        vo.setValidUntilLabel(formatValidUntil(order.getValidUntil()));
        vo.setAutoRenewTip(sku.getAutoRenewTip());
        vo.setPayMethod(order.getPayMethod());
        vo.setStatus(order.getStatus());
        vo.setQrCodeUrl(buildQrUrl(order.getQrPayload()));
        return vo;
    }

    private LocalDate calcValidUntil(int durationMonths) {
        if (durationMonths >= 999) {
            return LocalDate.now().plusYears(100);
        }
        return LocalDate.now().plusMonths(Math.max(durationMonths, 1));
    }

    private String formatValidUntil(LocalDate date) {
        if (date == null) return "";
        return date.format(DateTimeFormatter.ofPattern("yyyy-M-d"));
    }

    private String buildQrUrl(String payload) {
        String encoded = URLEncoder.encode(payload, StandardCharsets.UTF_8);
        return "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encoded;
    }

    private String resolveDisplayName(SysUser user) {
        if (StringUtils.hasText(user.getPhone()) && user.getPhone().length() >= 7) {
            return user.getPhone().substring(0, 3) + "****" + user.getPhone().substring(user.getPhone().length() - 4);
        }
        return user.getNickname() != null ? user.getNickname() : user.getUsername();
    }
}
