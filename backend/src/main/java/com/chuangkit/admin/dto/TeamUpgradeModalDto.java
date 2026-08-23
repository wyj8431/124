package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TeamUpgradeModalDto {
    private String formTitle;
    private LeftPanel leftPanel;
    private String sizeLabel;
    private List<SizeOption> sizeOptions = new ArrayList<>();
    private String ctaText;
    private String ctaBadge;
    private String personalLabel;
    private String teamLabel;
    private String redirectPath;
    private UserPreview userPreview;

    @Data
    public static class LeftPanel {
        private String title;
        private List<String> tags = new ArrayList<>();
        private List<String> collage = new ArrayList<>();
        private List<FeatureItem> features = new ArrayList<>();
    }

    @Data
    public static class FeatureItem {
        private String title;
        private String subtitle;
    }

    @Data
    public static class SizeOption {
        private String code;
        private String label;
    }

    @Data
    public static class UserPreview {
        private String maskedAccount;
        private String avatar;
        private String teamName;
        private String teamAvatarText;
    }
}
