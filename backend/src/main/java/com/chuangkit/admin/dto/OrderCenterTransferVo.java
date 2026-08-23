package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class OrderCenterTransferVo {
    private Long id;
    private String transferNo;
    private Integer amount;
    private String amountLabel;
    private String payerName;
    private String remark;
    private String status;
    private String statusLabel;
    private String createTime;
}
