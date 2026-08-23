package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class MessageCenterIndexDto {
    private String pageTitle;
    private String emptyText;
    private int unreadCount;
    private List<CategoryTab> categories;

    @Data
    public static class CategoryTab {
        private String code;
        private String name;
        private int unreadCount;
    }
}
