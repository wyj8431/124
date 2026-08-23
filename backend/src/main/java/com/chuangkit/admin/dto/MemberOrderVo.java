package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class MemberOrderVo {
    private Long orderId;
    private String orderNo;
    private Integer totalPrice;
    private Integer originalPrice;
    private Integer savedAmount;
    private String validUntilLabel;
    private String autoRenewTip;
    private String qrCodeUrl;
    private String payMethod;
    private String status;
}
