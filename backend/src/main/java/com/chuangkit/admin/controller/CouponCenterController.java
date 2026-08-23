package com.chuangkit.admin.controller;

import com.chuangkit.admin.common.Result;
import com.chuangkit.admin.dto.CouponCenterIndexDto;
import com.chuangkit.admin.dto.CouponCenterListDto;
import com.chuangkit.admin.security.SecurityUtils;
import com.chuangkit.admin.service.CouponCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/coupon-center")
@RequiredArgsConstructor
public class CouponCenterController {

    private final CouponCenterService couponCenterService;

    @GetMapping("/index")
    public Result<CouponCenterIndexDto> index() {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(couponCenterService.getIndex(userId));
    }

    @GetMapping("/coupons")
    public Result<CouponCenterListDto> coupons(
            @RequestParam(defaultValue = "unused") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.requireUserId();
        return Result.ok(couponCenterService.listCoupons(userId, status, page, pageSize));
    }
}
