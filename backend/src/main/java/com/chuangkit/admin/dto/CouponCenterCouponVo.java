package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class CouponCenterCouponVo {
    private Long id;
    private String title;
    private String couponCode;
    private String discountType;
    private String discountLabel;
    private String minAmountLabel;
    private String scopeLabel;
    private String status;
    private String statusLabel;
    private String expireTime;
    private String usedTime;
}
