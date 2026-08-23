package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MembershipCheckoutDto {

    private UserBlock user;
    private List<GroupBlock> groups = new ArrayList<>();

    @Data
    public static class UserBlock {
        private String displayName;
        private String avatar;
        private String levelLabel;
        private String slogan;
    }

    @Data
    public static class GroupBlock {
        private String code;
        private String title;
        private String subtitle;
        private Integer minSeats;
        private Integer maxSeats;
        private List<TierBlock> tiers = new ArrayList<>();
    }

    @Data
    public static class TierBlock {
        private Long id;
        private String code;
        private String name;
        private String description;
        private Integer minSeats;
        private Integer maxSeats;
        private List<SkuBlock> skus = new ArrayList<>();
        private List<BenefitBlock> benefits = new ArrayList<>();
    }

    @Data
    public static class SkuBlock {
        private Long id;
        private String name;
        private Integer price;
        private Integer originalPrice;
        private String badgeText;
        private String footerText;
        private String perMonthText;
        private Integer durationMonths;
        private Boolean autoRenew;
        private String autoRenewTip;
        private Boolean perPerson;
    }

    @Data
    public static class BenefitBlock {
        private String title;
        private String description;
        private String icon;
    }
}
