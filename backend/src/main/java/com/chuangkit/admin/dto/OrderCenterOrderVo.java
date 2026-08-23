package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class OrderCenterOrderVo {
    private Long id;
    private String orderNo;
    private String productName;
    private String productDesc;
    private Integer amount;
    private String amountLabel;
    private Integer seatCount;
    private String status;
    private String statusLabel;
    private String payMethod;
    private String payMethodLabel;
    private String createTime;
    private String payTime;
    private boolean canPay;
    private boolean canCancel;
    private boolean canInvoice;
    private String qrCodeUrl;
}
