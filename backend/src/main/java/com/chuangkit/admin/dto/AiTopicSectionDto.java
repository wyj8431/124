package com.chuangkit.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiTopicSectionDto {
    private Long id;
    private String title;
    private String emoji;
    private String displayTitle;
    private String moreText;
    private String moreLink;
    private List<AiTopicInspirationDto> items;
}
