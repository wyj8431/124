package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.MemberOrderCreateRequest;
import com.chuangkit.admin.dto.MemberOrderVo;
import com.chuangkit.admin.dto.MembershipCheckoutDto;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.MemberCheckoutService;
import com.chuangkit.admin.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final MemberCheckoutService checkoutService;

    @GetMapping("/plans")
    public Result<?> plans() {
        return Result.ok(memberService.listPlanGroups());
    }

    /** 开通会员弹窗 — 聚合配置 */
    @GetMapping("/checkout/index")
    public Result<MembershipCheckoutDto> checkoutIndex() {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(checkoutService.getCheckoutIndex(userId));
    }

    /** 创建会员订单并生成支付二维码 */
    @PostMapping("/checkout/order")
    public Result<MemberOrderVo> createOrder(@Valid @RequestBody MemberOrderCreateRequest req) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(checkoutService.createOrder(userId, req));
    }

    /** 查询订单支付状态 */
    @GetMapping("/checkout/order/{orderId}/status")
    public Result<MemberOrderVo> orderStatus(@PathVariable Long orderId) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(checkoutService.getOrderStatus(userId, orderId));
    }

    /** 演示环境：模拟扫码支付成功 */
    @PostMapping("/checkout/order/{orderId}/simulate-pay")
    public Result<MemberOrderVo> simulatePay(@PathVariable Long orderId) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(checkoutService.simulatePay(userId, orderId));
    }
}
