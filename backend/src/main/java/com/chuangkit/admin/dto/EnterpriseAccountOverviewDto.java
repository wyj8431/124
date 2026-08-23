package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class EnterpriseAccountOverviewDto {
    private String pageTitle;
    private List<NavItem> navItems = new ArrayList<>();
    private AccountInfo accountInfo;
    private MembersBlock members;
    private StorageBlock storage;
    private PointsBlock points;
    private List<QuickAccessItem> quickAccess = new ArrayList<>();
    private PromoCard promoCard;

    @Data
    public static class NavItem {
        private Long id;
        private String name;
        private String code;
        private String routePath;
        private String badgeText;
        private List<NavItem> children = new ArrayList<>();
    }

    @Data
    public static class AccountInfo {
        private String teamName;
        private String teamIdLabel;
        private String versionLabel;
        private String avatarText;
        private String vipCtaText;
        private String vipCtaLink;
        private String flagshipCtaText;
        private String flagshipCtaLink;
    }

    @Data
    public static class MembersBlock {
        private int current;
        private int max;
        private int percent;
        private String manageRoute;
    }

    @Data
    public static class StorageBlock {
        private String usedLabel;
        private String totalLabel;
        private int percent;
        private String expandLink;
        private String detailRoute;
    }

    @Data
    public static class PointsBlock {
        private int balance;
        private String buyLink;
        private String detailRoute;
    }

    @Data
    public static class QuickAccessItem {
        private String code;
        private String name;
        private String description;
        private String icon;
        private String routePath;
    }

    @Data
    public static class PromoCard {
        private String title;
        private String subtitle;
        private String badgeText;
        private String ctaText;
        private String ctaLink;
    }
}
