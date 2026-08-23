package com.chuangkit.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

public final class OrderCenterRequests {

    private OrderCenterRequests() {}

    @Data
    public static class ApplyInvoice {
        @NotBlank private String invoiceType;
        @NotBlank private String title;
        private String taxNo;
        @NotBlank @Email private String email;
        private String remark;
        @NotEmpty private List<Long> orderIds = new ArrayList<>();
    }

    @Data
    public static class SubmitTransfer {
        @Min(1) private Integer amountCents;
        @NotBlank private String payerName;
        private String remark;
    }
}
