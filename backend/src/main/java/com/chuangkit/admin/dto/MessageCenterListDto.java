package com.chuangkit.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class MessageCenterListDto {
    private List<MessageCenterMessageVo> list;
    private long total;
    private long page;
    private long pageSize;
    private long totalPages;
    private int unreadCount;
}
