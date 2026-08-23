package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TeamIntroPageDto {
    private Hero hero;
    private String teamNavBadge;
    private ConsultantWidget consultant;
    private List<FeatureSection> features = new ArrayList<>();

    @Data
    public static class Hero {
        private String title;
        private String subtitle;
        private String ctaText;
    }

    @Data
    public static class ConsultantWidget {
        private String title;
        private String subtitle;
        private String qrCodeUrl;
        private String avatarUrl;
        private String ctaText;
    }

    @Data
    public static class FeatureSection {
        private String code;
        private String title;
        private String subtitle;
        private String imageUrl;
        private String layout;
        private String ctaText;
        private List<String> bullets = new ArrayList<>();
    }
}
