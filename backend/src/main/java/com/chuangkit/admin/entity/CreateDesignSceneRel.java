package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("create_design_scene_rel")
public class CreateDesignSceneRel {
    @TableId(type = IdType.AUTO) private Long id;
    private String navCode;
    private Long sceneId;
    private String sizeTabCode;
    private Integer sortOrder;
    private Integer status;
}
