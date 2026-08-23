package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class OrderCenterInvoiceVo {
    private Long id;
    private String invoiceNo;
    private String invoiceType;
    private String invoiceTypeLabel;
    private String title;
    private String taxNo;
    private String email;
    private Integer amount;
    private String amountLabel;
    private String status;
    private String statusLabel;
    private String createTime;
    private String issueTime;
    private List<Item> items = new ArrayList<>();

    @Data
    public static class Item {
        private Long orderId;
        private String orderNo;
        private String productName;
        private String amountLabel;
    }
}
