package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class HelpFabIndexDto {
    private List<MenuItem> items = new ArrayList<>();
    private CustomerService customerService;

    @Data
    public static class MenuItem {
        private Long id;
        private String name;
        private String code;
        private String icon;
        private String linkUrl;
        /** _blank / _self / action */
        private String linkTarget;
    }

    @Data
    public static class CustomerService {
        private String title;
        private String subtitle;
        private String qrCodeUrl;
        private String avatarUrl;
    }
}
