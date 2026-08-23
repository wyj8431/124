package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class CouponCenterIndexDto {
    private String pageTitle;
    private String breadcrumbParent;
    private String breadcrumbCurrent;
    private String backText;
    private String instructionsTitle;
    private String instructionsContent;
    private List<StatusTab> tabs;

    @Data
    public static class StatusTab {
        private String code;
        private String name;
        private String emptyText;
        private int count;
    }
}
