package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("design_scene")
public class DesignScene {
    @TableId(type = IdType.AUTO) private Long id;
    private String name;
    private String code;
    private String icon;
    private String subtitle;
    private String previewUrl;
    private Integer width;
    private Integer height;
    private String unit;
    private String category;
    private Integer sortOrder;
    private Integer status;
    @TableLogic private Integer deleted;
    private LocalDateTime createTime;
}
