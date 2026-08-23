package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("team_upgrade_config")
public class TeamUpgradeConfig {
    @TableId
    private Long id;
    private String formTitle;
    private String leftTitle;
    private String leftTags;
    private String leftCollage;
    private String leftFeatures;
    private String sizeLabel;
    private String ctaText;
    private String ctaBadge;
    private String personalLabel;
    private String teamLabel;
    private String redirectPath;
    private LocalDateTime updateTime;
}
