package com.chuangkit.admin.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("team_intro_config")
public class TeamIntroConfig {
    @TableId
    private Long id;
    private String heroTitle;
    private String heroSubtitle;
    private String heroCtaText;
    private String teamNavBadge;
    private String consultantTitle;
    private String consultantSubtitle;
    private String consultantQrUrl;
    private String consultantAvatarUrl;
    private String consultantCtaText;
    private LocalDateTime updateTime;
}
