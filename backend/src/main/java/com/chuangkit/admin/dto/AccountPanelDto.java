package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class AccountPanelDto {

    private UserBlock user;
    private MemberBlock member;
    private StorageBlock storage;
    private AiCreditsBlock aiCredits;
    private AccountSwitcherBlock accountSwitcher;
    private List<MenuItem> menuItems;

    @Data
    public static class UserBlock {
        private Long id;
        private String displayName;
        private String avatar;
        private String roleLabel;
        private String userIdLabel;
    }

    @Data
    public static class MemberBlock {
        private String levelName;
        private String title;
        private String subtitle;
        private String ctaText;
        private String ctaLink;
    }

    @Data
    public static class StorageBlock {
        private long usedBytes;
        private long totalBytes;
        private String usedLabel;
        private String totalLabel;
        private int percent;
    }

    @Data
    public static class AiCreditsBlock {
        private int balance;
        private String tip;
    }

    @Data
    public static class AccountSwitcherBlock {
        private String displayName;
        private String versionLabel;
        private String createTeamText;
        private String trialBadge;
    }

    @Data
    public static class MenuItem {
        private String code;
        private String name;
        private String icon;
        private String routePath;
    }
}
