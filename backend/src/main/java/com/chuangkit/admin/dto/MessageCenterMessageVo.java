package com.chuangkit.admin.dto;

import lombok.Data;

@Data
public class MessageCenterMessageVo {
    private Long id;
    private String category;
    private String categoryLabel;
    private String title;
    private String summary;
    private String content;
    private String linkUrl;
    private String linkText;
    private boolean read;
    private String createTime;
}
