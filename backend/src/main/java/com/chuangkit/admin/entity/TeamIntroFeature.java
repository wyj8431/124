package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("team_intro_feature")
public class TeamIntroFeature {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String code;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String layout;
    private String ctaText;
    private String bullets;
    private Integer sortOrder;
    private Integer status;
    @TableLogic
    private Integer deleted;
    private LocalDateTime createTime;
}
