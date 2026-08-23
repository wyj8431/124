package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("design_template")
public class DesignTemplate {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String coverUrl;
    private String previewUrl;
    private Long sceneId;
    private Long categoryId;
    private Integer width;
    private Integer height;
    private String canvasJson;
    private String tags;
    private Integer useCount;
    private Integer isFree;
    private Integer isHot;
    private Integer isRecommend;
    private Integer status;
    @TableLogic
    private Integer deleted;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
