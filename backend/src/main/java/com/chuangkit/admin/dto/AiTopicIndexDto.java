package com.chuangkit.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiTopicIndexDto {
    private String code;
    private String title;
    private String breadcrumbParent;
    private String breadcrumbParentUrl;
    private String promptPlaceholder;
    private String generateButtonText;
    private List<AiTopicPresetDto> presets;
    private List<AiTopicSectionDto> sections;
}
