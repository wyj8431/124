package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class OrderCenterIndexDto {
    private String emptyText;
    private String emptyInvoiceText;
    private String emptyHistoryText;
    private String emptyBalanceText;
    private List<NavItem> navItems = new ArrayList<>();
    private List<TabItem> orderTabs = new ArrayList<>();
    private List<TabItem> balanceTabs = new ArrayList<>();
    private BankAccount bankAccount;
    private List<InvoiceTypeOption> invoiceTypes = new ArrayList<>();

    @Data
    public static class NavItem {
        private String code;
        private String name;
        private String routePath;
    }

    @Data
    public static class TabItem {
        private String code;
        private String name;
    }

    @Data
    public static class BankAccount {
        private String companyName;
        private String bankName;
        private String accountNo;
        private String taxNo;
        private String remark;
        private String tip;
    }

    @Data
    public static class InvoiceTypeOption {
        private String code;
        private String name;
    }
}
