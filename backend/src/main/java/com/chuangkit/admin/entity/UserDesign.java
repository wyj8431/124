package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_design")
public class UserDesign {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String title;
    private String coverUrl;
    private Long sceneId;
    private Long templateId;
    private Long folderId;
    private String canvasJson;
    private Integer width;
    private Integer height;
    private Integer status;
    @TableLogic
    private Integer deleted;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
