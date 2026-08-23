package com.chuangkit.admin.dto;

import com.chuangkit.admin.entity.DesignTemplate;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class RecommendTemplateVo extends DesignTemplate {
    private Boolean liked;
    private Integer likeCount;
}
