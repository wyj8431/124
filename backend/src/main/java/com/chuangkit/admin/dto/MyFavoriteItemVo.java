package com.chuangkit.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MyFavoriteItemVo {
    private Long id;
    private Long templateId;
    private String title;
    private String coverUrl;
    private Integer width;
    private Integer height;
    private Integer isFree;
    private LocalDateTime likeTime;
}
